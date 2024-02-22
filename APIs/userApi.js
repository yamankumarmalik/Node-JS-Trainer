const express = require("express");

// Create mini express userApp
const userApp = express.Router();

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verifyToken");

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
  //check for duplicate user in database
  let userFromDb = await usersCollection.findOne({ username: user.username });

  if (userFromDb !== null) {
    res.status(200).send({ message: "User already existed!" });
  } else {
    //hash the password
    let hashedPassword = await bcryptjs.hash(user.password, 5);
    //convert plain password to hash password
    user.password = hashedPassword;
    //save user
    usersCollection.insertOne(user);
    //send res
    res.status(200).send({ message: "User created!" });
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

//to do user login
userApp.post("/users/user-login", async (req, res) => {
  //get user credentials
  let userCred = req.body;
  //check the user in db with username
  let userOfDb = await usersCollection.findOne({ username: userCred.username });
  //if passwords are not matched
  if (userOfDb === false) {
    res.status(404).send({ message: "Invalid username" });
  }
  //if user found
  else {
    //compare password
    let result = await bcryptjs.compare(userCred.password, userOfDb.password);
    //if passwords are not matched
    if (result === false) {
      res.status(404).send({ message: "Invalid password" });
    }
    //if passwords are matched
    else {
      //create a signed token
      let signedToken = jwt.sign({ username: userOfDb.username }, "abcdefgh", {
        expiresIn: 100,
      });
      //send token to client
      res
        .status(200)
        .send({ message: "login success", token: signedToken, user: userOfDb });
    }
  }
});

//protected route
userApp.get("/protected", verifyToken, (req, res) => {
  console.log(req.headers);
});


module.exports = userApp;
