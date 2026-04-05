import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { StatusCodes } from 'http-status-codes';
import appRouter from './routes/app.routes';
import { setupSockets } from './sockets';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// initialize socket io
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
setupSockets(io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST routes
app.use('/api', appRouter);

app.get('/', (req, res) => {
    res.status(StatusCodes.OK).send("Quoridor API is running 🚀");
});

const PORT = process.env.PORT || 3174;

httpServer.listen(PORT, () => {
    console.log(`✅ Server is sprinting on http://localhost:${PORT}`);
});

export default app;