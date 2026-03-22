require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
required.forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing required env variable: ${key}`);
});
