import cors from "cors";
import express from "express";
import rootRouter from "./routes/index.js";
import { initaliseDb } from "./utils/utils.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initaliseDb();

app.use("/api", rootRouter);

app.use("/", (req, res) => res.status(404).send("Invalid path"));

export default app;
