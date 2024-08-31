// Packages Import
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Routes Import
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";

const app = express();
dotenv.config();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/users", userRouter);
app.use('/api/auth', authRouter);

// Error Handler
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Server error";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    msg: errorMessage,
  });
});


const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to Mongodb");
  } catch (error) {
    console.log("Error connecting to mongodb: \n", error)
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("Warning: MongoDB connection has been disconnected.");
  
  console.log('Trying to reconnect to MongoDB');
  connect();
});


const port = 3000;

app.listen(port, () => {
  connect();
  console.log("Server is running on port " + port);
});
