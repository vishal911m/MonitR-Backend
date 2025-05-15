import express from "express";

const app = express();
const port = 8000;

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Test server is running on http://localhost:${port}`);
});
