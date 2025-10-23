// TODO: Import dependencies
import cors from "cors";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import morgan from "morgan";

import routes from "./routes/index.js";

// TODO: Create Express app

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

// TODO: Add middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api", routes);

// TODO: Connect routes

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from Express with Typescript!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
