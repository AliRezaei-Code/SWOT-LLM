import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

export const environment = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: PORT,
  mongoUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/wqta",
  allowCorsOrigins: (process.env.ALLOW_CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((value) => value.trim())
};
