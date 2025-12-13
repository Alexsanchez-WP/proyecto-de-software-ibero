import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";
import Database from "./config/database";

const app = express();
const PORT = process.env.PORT || 3000;

Database.getInstance().connect();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
