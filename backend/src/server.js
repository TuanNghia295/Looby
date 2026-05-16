import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './libs/db.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import messageRoute from './routes/messageRoute.js';
import friendRoute from './routes/friendRoute.js';
import conversationRoute from './routes/conversation.js';
import { protectedRoute } from './middlewares/authMiddleware.js';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Express will run code up to down.

// middlewares
app.use(express.json()); // help express understand and can read request body by JSON type
app.use(cookieParser()); // parse cookies
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// public routes
app.use('/api/auth', authRoute);

// private routes
app.use(protectedRoute); // middleware
app.use('/api/users', userRoute);
app.use('/api/friends', friendRoute);
app.use('/api/messages', messageRoute);
app.use('/api/conversation', conversationRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
});
