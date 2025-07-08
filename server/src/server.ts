import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import itemRoutes from "./routes/itemRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from the backend with MongoDB!");
});

app.use("/api/items", itemRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
