const express = require("express");

// Create a mini products express app
const products = express.Router();

products.get("/products", (req, res) => {
  res.send({ message: "Products" });
});

module.exports = products;