import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Дозволяє запити з React
app.use(express.json());

// Routes
app.use('/api', paymentRoutes);

app.get('/', (req, res) => {
    res.send('BMB Server is running 🚀');
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});