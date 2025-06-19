import express, { urlencoded } from 'express'
import Configs from './configs/index.configs.js';
import mongoose, { connect } from 'mongoose';
import authRoute from './routes/authRoutes.js';
import bookRoute from './routes/bookRoutes.js';
import cors from 'cors';

const app = express();

app.use(cors());

async function connectDB(URI) {
    try {
        const connection = await mongoose.connect(URI);
        console.log(`Database connected: ${connection.connection.host}`);
    } catch (error) {
        console.log("Database connection error.");
    }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoute);

app.use('/api/books', bookRoute);

app.listen(Configs.PORT || 5000, (err) => {
    if (err) {
        console.log("Server connection error.");
    } else {
        connectDB(Configs.DB_URI);
        console.log(`Server connected on port: ${Configs.PORT}`);
    }
});