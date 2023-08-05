const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

const generateToken = (payload) => {
    return jwt.sign(payload, secretKey);
};

const verifyToken = (token)=>{
    return jwt.verify(token, secretKey)
}

module.exports = {
    generateToken,
    verifyToken
}
