const constants = require("../config/constants.js");
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.users;

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, constants.JWT_KEY);
        if (req.originalUrl != "/user/signup"){
            User.findAll({ where: { id: decoded.userid }})
                .then(data => {
                    if (data.length < 1){
                        res.status(401).json({
                            message: "Auth failed"
                        });
                    } else {
                        req.userData = decoded;
                        next();
                    }
                })
                .catch(err => {
                    res.status(401).json({
                        message: "Auth failed"
                    });
                });
        } else {
            req.userData = decoded;
            next();
        }
    } catch (err) {        
        return res.status(401).json({
            message: "Auth failed"
        });
    }
}