import express from "express";
import v1 from "./routes/v1/index.routes";

const app = express();

app.use("/v1", v1);
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
