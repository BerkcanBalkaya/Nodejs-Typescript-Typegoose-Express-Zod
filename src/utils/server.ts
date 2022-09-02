import express from "express";
import deserializeUser from "../middleware/deserializeUser";
import router from "../routes";

function createServer() {
  const app = express();

  app.use(express.json());

  app.use(deserializeUser);

  app.use(router);
  return app;
}

export default createServer;
