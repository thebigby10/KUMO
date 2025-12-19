import express from 'express';
import authRoutes from './routes/auth';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());

app.use(express.json());

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

app.listen(PORT, () => {
  console.log(`Auth Service running on http://localhost:${PORT}`);
});