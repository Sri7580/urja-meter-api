
const express = require("express");
const metersRouter = require("./routes/meters");
const transformersRouter = require("./routes/transformers");
const consumptionRouter = require("./routes/consumption");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Urja Meter API is running",
  });
});

app.use("/api/v1/meters", metersRouter);
app.use("/api/v1/transformers", transformersRouter);
app.use("/api/v1/meters", consumptionRouter);

app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",
  });
});

module.exports = app;
