import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StatusCodes } from 'http-status-codes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import appRouter from './routes/app.routes';
app.use('/api', appRouter);

app.get('/', (req, res) => {
    res.status(StatusCodes.OK).send("Quoridor API is running 🚀");
});

const PORT = process.env.PORT || 3174;

app.listen(PORT, () => {
    console.log(`✅ Server is sprinting on http://localhost:${PORT}`);
});

export default app;