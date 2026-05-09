import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './libs/db.js';
import authRoute from './routes/authRoute.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(express.json()); // help express understand and can read request body by JSON type
app.use(cookieParser()); // parse cookies

// public routes
app.use('/api/auth', authRoute);

// private routes

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
});
