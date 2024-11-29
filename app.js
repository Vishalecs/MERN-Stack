const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');
const connectDB = require('./config/db');
// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
