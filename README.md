![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge&logo=mongodb&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)
![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=for-the-badge)

<p align="center">
  <img src="./assets/banner.png" alt="Samvaad Banner" width="420"/>
</p>

# 🗣️ Samvaad – संवाद | Video Calling Platform

**Samvaad** (Hindi: संवाद, meaning *conversation* or *dialogue*) is a full-stack real-time video calling platform built for modern teams.  
It enables peer-to-peer video calls, live chat, screen sharing, and room management — all wrapped in a clean, saffron-branded UI.

Built with 🔶 **Next.js + Node.js + Express + MongoDB + Socket.io + WebRTC**, Samvaad is designed for scalability, real-time performance, and a premium user experience.

---

## 🚀 What Samvaad Can Do

- 🔐 Secure Authentication (JWT access + refresh tokens)
- 🎥 Peer-to-peer HD Video & Audio Calls (WebRTC + PeerJS)
- 💬 Real-time In-meeting Chat (Socket.io)
- 🖥️ Screen Sharing Support
- 🏠 Dynamic Room Creation with Unique Room Codes
- 🎙️ Mic & Camera Toggle Controls
- 📋 Meeting History with MongoDB persistence
- 🌗 Light & Dark Mode UI
- 🌐 REST APIs for all platform operations

---

## 🛠️ Tech Stack

### Backend
| Tool | Purpose |
|------|---------|
| Node.js | Backend JavaScript runtime |
| Express.js | API server framework |
| MongoDB Atlas | NoSQL cloud database |
| Mongoose | MongoDB object modeling |
| Socket.io | Real-time signalling & chat |
| PeerJS | WebRTC peer-to-peer media |
| JWT | Access & refresh token auth |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| Helmet.js | HTTP security headers |
| express-rate-limit | API rate limiting |
| Winston | Structured logging |
| nanoid | Unique room ID generation |
| Nodemailer | Email notifications |

### Frontend
| Tool | Purpose |
|------|---------|
| Next.js 14 | React framework with App Router |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible UI components |
| Bootstrap 5 | Layout & responsive grid |
| Bootstrap Icons | SVG icon library |
| Socket.io Client | Real-time socket connection |
| PeerJS Client | WebRTC peer connections |
| Zustand | Global client state |

---

## 📁 Project Structure

```bash
Samvaad/
│
├── samvaad-backend/                  # Express + Node.js API server
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection
│   │   │   └── env.js                # Environment validation
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── room.controller.js
│   │   │   ├── meeting.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT protection
│   │   │   ├── error.middleware.js   # Global error handler
│   │   │   ├── validate.middleware.js
│   │   │   └── rateLimit.middleware.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── Room.model.js
│   │   │   └── Meeting.model.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── auth.routes.js
│   │   │   ├── room.routes.js
│   │   │   ├── meeting.routes.js
│   │   │   └── user.routes.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── room.service.js
│   │   │   ├── meeting.service.js
│   │   │   └── email.service.js
│   │   ├── socket/
│   │   │   ├── index.js              # Socket.io init + JWT auth
│   │   │   ├── room.socket.js        # Room events + WebRTC signalling
│   │   │   └── chat.socket.js        # Real-time chat
│   │   └── utils/
│   │       ├── jwt.js
│   │       ├── hash.js
│   │       ├── response.js
│   │       └── logger.js
│   ├── logs/
│   ├── .env.example
│   ├── package.json
│   └── server.js                     # Entry point
│
└── samvaad-frontend/                 # Next.js 14 App
    ├── src/
    │   ├── app/
    │   │   ├── layout.js             # Root layout
    │   │   ├── page.js               # Landing page  /
    │   │   ├── dashboard/
    │   │   │   └── page.js           # Dashboard      /dashboard
    │   │   ├── room/
    │   │   │   └── [roomId]/
    │   │   │       └── page.js       # Meeting room   /room/:id
    │   │   └── auth/
    │   │       ├── login/
    │   │       │   └── page.js       # Login          /auth/login
    │   │       └── register/
    │   │           └── page.js       # Register       /auth/register
    │   ├── components/
    │   │   └── ui/                   # shadcn/ui components
    │   ├── lib/
    │   └── store/                    # Zustand state
    ├── public/
    ├── .env.local
    └── package.json
```

---

## ⚙️ Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Preetesh1/Samvaad.git
cd Samvaad
```

### 2️⃣ Setup the Backend

```bash
cd samvaad-backend
npm install
```

Create a `.env` file in `samvaad-backend/`:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/samvaad

JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=7d
```

```bash
npm run dev
```

Backend runs at 👉 **`http://localhost:5001`**

### 3️⃣ Setup the Frontend

```bash
cd samvaad-frontend
npm install
```

Create a `.env.local` file in `samvaad-frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

```bash
npm run dev
```

Frontend runs at 👉 **`http://localhost:3000`**

---

## ✨ Core Features

- 🔐 JWT Authentication with access + refresh tokens
- 🎥 Peer-to-peer video & audio via WebRTC + PeerJS
- 💬 Real-time in-meeting chat persisted to MongoDB
- 🖥️ Screen sharing with `getDisplayMedia()` API
- 🏠 Instant room creation with nanoid room codes
- 🎙️ Mic & camera toggle with live media track control
- 📋 Meeting history — every session stored with participants
- 🌗 Light & Dark mode toggle
- 🛡️ Rate limiting, helmet security, input validation
- 📡 Socket.io signalling for WebRTC offer/answer/ICE exchange

---

## 📡 API Endpoints Overview

### 🔐 Auth Routes (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Register new user |
| POST | `/login` | — | Login & get tokens |
| GET | `/me` | ✓ | Get current user |
| POST | `/logout` | ✓ | Logout |

### 🏠 Room Routes (`/api/v1/rooms`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✓ | Create a new room |
| GET | `/:roomId` | ✓ | Get room details |
| POST | `/:roomId/join` | ✓ | Join a room |
| POST | `/:roomId/leave` | ✓ | Leave a room |
| DELETE | `/:roomId` | ✓ | End room (host only) |

### 📋 Meeting Routes (`/api/v1/meetings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | Get meeting history |
| GET | `/:id` | ✓ | Get single meeting |

### 👤 User Routes (`/api/v1/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | ✓ | Get user profile |
| PATCH | `/profile` | ✓ | Update profile |

---

## 📡 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `room:join` | Client → Server | Join a room |
| `room:leave` | Client → Server | Leave a room |
| `room:end` | Client → Server | End room (host) |
| `room:user-joined` | Server → Client | New participant joined |
| `room:user-left` | Server → Client | Participant left |
| `room:ended` | Server → Client | Room ended by host |
| `webrtc:offer` | Peer → Peer | WebRTC SDP offer |
| `webrtc:answer` | Peer → Peer | WebRTC SDP answer |
| `webrtc:ice-candidate` | Peer → Peer | ICE candidate exchange |
| `media:toggle` | Client → Room | Mic / camera toggle |
| `chat:message` | Both | Send & receive chat |

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://samvaad-delta.vercel.app |
| Backend | Render | https://samvaad-backend-jhnc.onrender.com |
| Database | MongoDB Atlas | Cloud hosted |

---

## 🏗️ Architecture

```
Browser (Next.js)
    │
    ├── REST API (Axios) ──────────────► Express /api/v1/*
    │                                         │
    ├── Socket.io client ──────────────► Socket.io server
    │        │                                │
    │   WebRTC signalling               MongoDB Atlas
    │   offer / answer / ICE
    │
    └── PeerJS ◄───────────────────────► PeerJS (peer browser)
              └── Direct P2P video & audio stream
```

---

## 🚫 Important Notice

> This repository is **public only for portfolio and demonstration purposes**.
>
> **All Rights Reserved.**
> Unauthorized copying, redistribution, or commercial use of this project is strictly prohibited without explicit permission from the author.

---

### 🛡️ Project by **Preetesh Sharma**

**Samvaad © All Rights Reserved · संवाद — Conversations that connect.**