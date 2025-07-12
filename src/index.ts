import "dotenv/config";
import express from "express";
import connectDB from "./infrastructure/db";

import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import solarUnitsRouter from "./api/solar-unit";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handling-middleware";

// Create an Express instance
const app = express();

app.use(clerkMiddleware());
// Middleware to parse JSON data in the request body
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.use(express.json());

app.use("/api/solar-units", solarUnitsRouter);

app.use(globalErrorHandlingMiddleware);

// Define the port to run the server
connectDB();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
