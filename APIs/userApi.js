const express = require("express");

// Create mini express userApp
const userApp = express.Router();

//sample user data
let users = [{ id: 100, name: "Ravi" }];

let usersCollection;
userApp.use((req, res, next) => {
  usersCollection = req.app.get("usersCollection");
  next();
});

//get all users
userApp.get("/users", async (req, res, next) => {
  try {
    //read all users
    const users = await usersCollection.find().toArray();
    res.status(200).send({ message: "users", payload: users });
  } catch (err) {
    //handover the error to error handler middleware
    next(err);
  }
});

//get user by id
userApp.get("/users/:userId", async (req, res) => {
  //get user id from url
  const userId = Number(req.params.userId);
  //find user by id
  let user = await usersCollection.findOne({ id: userId });
  //send res
  res.status(200).send({ message: "Found user is: ", payload: user });
});

//post req handler
userApp.post("/users", async (req, res) => {
  //get user from client
  const user = req.body;
  //save to usersCollection
  let dbRes = await usersCollection.insertOne(user);

  //send res
  if (dbRes.acknowledged === true) {
    res.status(201).send({ message: "User Created" });
  } else {
    res.status(500).send({ message: "Something went wrong!" });
  }
});

//put request handler
userApp.put("/users", async (req, res) => {
  //get modified user from the client
  const user = req.body;
  //update by user id
  let dbRes = await usersCollection.updateOne(
    { id: user.id },
    { $set: { ...user } }
  );
  //send res
  if (dbRes.acknowledged === true) {
    res.status(201).send({ message: "User modified" });
  }
});

userApp.delete("/users/:id", async (req, res) => {
  //get userId to delete
  const userId = Number(req.params.id);
  //delete the user
  let dbRes = await usersCollection.deleteOne({ id: userId });
  console.log(dbRes);
});

module.exports = userApp;
