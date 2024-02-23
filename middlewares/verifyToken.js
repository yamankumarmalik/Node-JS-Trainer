const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  //token verification logic
  //get bearer token from headers of req object
  const bearerToken = req.headers.authorization;
  if (bearerToken) {
    const token = bearerToken.split(" ")[1];
    //verify the token
    const decodedToken = jwt.verify(token, 'abcdefgh');
    next();
    
  } else {
    res.status(200).send({ message: "Unauthorized access!" });
  }
}

module.exports = verifyToken;
