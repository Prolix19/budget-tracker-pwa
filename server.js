// Bring in requirements
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

// Set up variables
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/budget";

// Set up Express
const app = express();

app.use(logger("dev"));

// Middleware
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

// Connect to MongoDB with Mongoose
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false
});

// Bring in routes
app.use(require("./routes/api.js"));

// Start the server
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});