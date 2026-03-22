"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import Peer from "peerjs";

export default function Room() {
  const { roomId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [peers, setPeers] = useState({});
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [participants, setParticipants] = useState([]);
  const [timer, setTimer] = useState(0);
  const [copying, setCopying] = useState(false);

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const myVideoRef = useRef(null);
  const peersRef = useRef({});

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) { router.push("/auth/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    initRoom(u, token);
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => {
      clearInterval(interval);
      cleanup();
    };
  }, []);

  const initRoom = async (u, token) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;

      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, { auth: { token } });
      socketRef.current = socket;

      const peer = new Peer();
      peerRef.current = peer;

      peer.on("open", (peerId) => {
        socket.emit("room:join", { roomId });

        socket.on("room:user-joined", ({ userId, user: joinedUser }) => {
          const call = peer.call(userId, stream, { metadata: { user: joinedUser } });
          call.on("stream", (remoteStream) => {
            addPeer(userId, remoteStream, joinedUser);
          });
        });

        socket.on("room:user-left", ({ userId }) => {
          removePeer(userId);
        });

        socket.on("room:ended", () => {
          alert("Meeting ended by host");
          router.push("/dashboard");
        });

        socket.on("chat:message", (msg) => {
          setMessages(prev => [...prev, msg]);
        });
      });

      peer.on("call", (call) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          addPeer(call.peer, remoteStream, call.metadata?.user);
        });
      });

    } catch (err) {
      alert("Could not access camera/microphone: " + err.message);
    }
  };

  const addPeer = (id, stream, peerUser) => {
    peersRef.current[id] = { stream, user: peerUser };
    setPeers({ ...peersRef.current });
    setParticipants(prev => {
      if (prev.find(p => p.id === id)) return prev;
      return [...prev, { id, user: peerUser }];
    });
  };

  const removePeer = (id) => {
    delete peersRef.current[id];
    setPeers({ ...peersRef.current });
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const cleanup = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    socketRef.current?.disconnect();
    peerRef.current?.destroy();
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMuted(!muted); }
    socketRef.current?.emit("media:toggle", { roomId, type: "audio", value: !muted });
  };

  const toggleCam = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOff(!camOff); }
    socketRef.current?.emit("media:toggle", { roomId, type: "video", value: !camOff });
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      Object.values(peersRef.current).forEach(({ stream }) => {
        const sender = stream?.getTracks?.();
      });
      if (myVideoRef.current) myVideoRef.current.srcObject = screenStream;
      screenTrack.onended = () => {
        if (myVideoRef.current) myVideoRef.current.srcObject = streamRef.current;
      };
    } catch (err) { console.log("Screen share cancelled"); }
  };

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    socketRef.current?.emit("chat:message", { roomId, text: msgInput });
    setMsgInput("");
  };

  const endCall = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}/leave`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    cleanup();
    router.push("/dashboard");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (!user) return null;

  const allParticipants = [
    { id: "me", stream: streamRef.current, user, isMe: true },
    ...Object.entries(peers).map(([id, p]) => ({ id, stream: p.stream, user: p.user, isMe: false })),
  ];

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* Room header */}
      <div style={{
        height: "56px", background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            Sam<span style={{ color: "var(--saffron)" }}>vaad</span>
          </div>
          <button onClick={copyCode} style={{
            background: "var(--bg)", border: "1px solid var(--border-2)",
            borderRadius: "6px", padding: "4px 10px",
            fontSize: "11px", color: "var(--text-secondary)",
            cursor: "pointer", fontFamily: "monospace",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            <i className="bi bi-copy" style={{ fontSize: "10px" }}></i>
            {copying ? "Copied!" : roomId}
          </button>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "var(--saffron-subtle)", border: "1px solid var(--saffron-border)",
          borderRadius: "20px", padding: "4px 12px",
          fontSize: "11px", fontWeight: 600, color: "var(--saffron)",
        }}>
          <span style={{ width: "6px", height: "6px", background: "var(--saffron)", borderRadius: "50%", display: "inline-block" }}></span>
          Live · {formatTime(timer)}
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Video grid */}
        <div style={{
          flex: 1, display: "grid",
          gridTemplateColumns: allParticipants.length === 1 ? "1fr" : "repeat(2, 1fr)",
          gap: "10px", padding: "16px",
          alignContent: "start",
        }}>
          {allParticipants.map((p) => (
            <VideoTile key={p.id} participant={p} isMe={p.isMe} videoRef={p.isMe ? myVideoRef : null} />
          ))}
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div style={{
            width: "280px", background: "var(--bg-surface)",
            borderLeft: "1px solid var(--border)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
              Meeting chat
            </div>
            <div style={{ flex: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.length === 0 && (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", marginTop: "20px" }}>
                  No messages yet
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--saffron)", marginBottom: "3px" }}>
                    {m.senderName}
                  </div>
                  <div style={{
                    background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: "8px", padding: "7px 10px",
                    fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.5,
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px", borderTop: "1px solid var(--border)", display: "flex", gap: "6px" }}>
              <input
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Send a message..."
                style={{
                  flex: 1, padding: "8px 10px",
                  background: "var(--bg)", border: "1px solid var(--border-2)",
                  borderRadius: "7px", fontSize: "12px",
                  color: "var(--text-primary)", outline: "none",
                }}
              />
              <button onClick={sendMessage} style={{
                background: "var(--saffron)", border: "none",
                borderRadius: "7px", padding: "8px 12px",
                color: "#fff", cursor: "pointer",
              }}>
                <i className="bi bi-send-fill" style={{ fontSize: "12px" }}></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        background: "var(--bg-surface)", borderTop: "1px solid var(--border)",
        padding: "16px", display: "flex",
        alignItems: "center", justifyContent: "center", gap: "10px",
      }}>
        <CtrlBtn icon={muted ? "bi-mic-mute-fill" : "bi-mic-fill"} active={muted} onClick={toggleMic} label={muted ? "Unmute" : "Mute"} />
        <CtrlBtn icon={camOff ? "bi-camera-video-off-fill" : "bi-camera-video-fill"} active={camOff} onClick={toggleCam} label={camOff ? "Start video" : "Stop video"} />
        <CtrlBtn icon="bi-display" onClick={shareScreen} label="Share screen" />
        <div style={{ width: "1px", height: "24px", background: "var(--border-2)" }}></div>
        <CtrlBtn icon="bi-chat-text" onClick={() => setChatOpen(!chatOpen)} label="Chat" highlighted={chatOpen} />
        <CtrlBtn icon="bi-people" label="Participants" onClick={() => {}} />
        <div style={{ width: "1px", height: "24px", background: "var(--border-2)" }}></div>
        <button onClick={endCall} style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: "#dc3545", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.15s",
        }}>
          <i className="bi bi-telephone-x-fill" style={{ color: "#fff", fontSize: "17px" }}></i>
        </button>
      </div>

    </main>
  );
}

function VideoTile({ participant, isMe, videoRef }) {
  const localRef = useRef(null);
  const ref = videoRef || localRef;

  useEffect(() => {
    if (ref.current && participant.stream) {
      ref.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const initials = participant.user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";

  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: "12px",
      border: "1px solid var(--border)",
      minHeight: "160px", position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <video
        ref={ref}
        autoPlay
        muted={isMe}
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
      />
      <div style={{
        position: "absolute", bottom: "10px", left: "10px",
        background: "rgba(0,0,0,0.5)", borderRadius: "6px",
        padding: "3px 8px", fontSize: "11px", fontWeight: 500, color: "#fff",
      }}>
        {isMe ? `You (${participant.user?.name})` : participant.user?.name || "Guest"}
      </div>
    </div>
  );
}

function CtrlBtn({ icon, onClick, label, active, highlighted }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: "46px", height: "46px", borderRadius: "50%",
        background: active ? "rgba(220,50,50,0.12)" : highlighted ? "var(--saffron-subtle)" : "var(--bg-card)",
        border: `1px solid ${active ? "rgba(220,50,50,0.3)" : highlighted ? "var(--saffron-border)" : "var(--border-2)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      <i className={`bi ${icon}`} style={{
        fontSize: "17px",
        color: active ? "#dc3545" : highlighted ? "var(--saffron)" : "var(--text-secondary)",
      }}></i>
    </button>
  );
}