import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import routes from './routes';
import devLoginRoutes from "./routes/devLoginRoutes";

// Connect to Database
connectDB();

const app = express();

// --- Core Middleware ---
// Enable Cross-Origin Resource Sharing
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());
// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

// This is where we mount our API routes
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

if (process.env.NODE_ENV !== "production") {
  app.use("/api/dev", devLoginRoutes);
}

export default app;
