const express = require('express');
require('dotenv').config(); // Load environment variables from .env file
const app = express();
const cookieParser = require('cookie-parser');
const {DBConnection}= require("./database/db");
const cors = require('cors');


app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://35.154.220.113:5173',  
    'https://sparkathon-frontend.vercel.app'
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - simple test endpoint
app.get("/",(req,res)=> {
    res.send("hello world is coming from backend");
});

// Await DB connection before starting the server
(async () => {
  try {
    await DBConnection();
    console.log("✅ MongoDB connected");

    // Import routes
    const authRoutes = require('./routes/authRoutes');
    const productRoutes = require('./routes/productRoutes');
    const orderRoutes = require('./routes/orderRoutes');
    const greenRoutes = require('./routes/greenRoutes');
    const environmentalRoutes = require('./routes/environmentalRoutes');
    const userRoutes= require('./routes/userRoutes');
    
    // Use routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/green', greenRoutes);
    app.use('/api/environmental', environmentalRoutes);
  app.use('/api/user',userRoutes);

    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  }
})();

app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR HANDLER:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});