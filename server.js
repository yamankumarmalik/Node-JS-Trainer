const express = require("express");
const userApp = require("./APIs/userApi");
const products = require("./APIs/products");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

//Connecting to mongodb database
const url = "mongodb://127.0.0.1:27017";
MongoClient.connect(url)
  .then((client) => {
    //get db object
    const dbObj = client.db("admin");
    //get collection obj
    const usersCollection = dbObj.collection("users");
    //add usersCollection to express on express (app)
    app.set('usersCollection', usersCollection);
    console.log("Connected to database server!");
  })
  .catch((err) => {
    console.log("err in DB connect", err);
  });

//create error handling middleware
function errorHandling(err, req, res, next) {
  res.send({ message: "Error occurred!", payload: err.message });
}

app.use("/user-api", userApp);
app.use("/products-api", products);
app.use(errorHandling);

app.listen(4000, () => {
  console.log("Server started at port no 4000");
});
