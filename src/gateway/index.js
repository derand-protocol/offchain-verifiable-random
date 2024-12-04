import cors from "cors";
import express from "express";
import api from "./api/index.js";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", api);
app.use(express.static("static"));

export default app;
