import mongoose from "mongoose";

import { createApp } from "./app.js";
import { environment } from "./config/environment.js";

const app = createApp();

const start = async () => {
  try {
    await mongoose.connect(environment.mongoUri);
    console.log(`[server] Connected to MongoDB at ${environment.mongoUri}`);

    app.listen(environment.port, () => {
      console.log(`[server] Listening on http://localhost:${environment.port}`);
    });
  } catch (error) {
    console.error("[server] Failed to start application", error);
    process.exit(1);
  }
};

start();
