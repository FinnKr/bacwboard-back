const constants = require("../config/constants.js");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, constants.JWT_KEY);
        req.userData = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Auth failed"
        });
    }
}