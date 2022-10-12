import express from "express";
import cors from "cors";

import "./db/index.js";
import { defaultTask } from "./utils/cron.js";
import collectionRouter from "./routes/collection.route.js";
import openseaCollectionRouter from "./routes/openseaCollection.route.js";
import adminRouter from "./routes/admin.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/collection", collectionRouter);
app.use("/api", openseaCollectionRouter);
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("<h3>Welcome to Rarity Api</h3>");
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
  defaultTask.start();
});
