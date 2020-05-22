const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const constants = require("../config/constants.js");
const User = db.users;
const Op = db.Sequelize.Op;

// Create and Save a new User

exports.create = (req, res) => {
    // Check role
    if (req.userData.role == "admin") {
        // Validate request
        if (!req.body.mail || !req.body.password || !req.body.role) {
            res.status(400).json({
                message: "Mail, password or role cannot be empty!"
            });
        } else {
            User.findAll({ where: { mail: req.body.mail }})
                .then(data => {
                    if (data.length >= 1) {
                        res.status(422).json({
                            message: "Mail already exists!"
                        });
                    } else {
                        bcrypt.hash(req.body.password, 10, (err, hash) => {
                            if (err) {
                                res.status(500).json({
                                    message: "Internal error occured while hashing the password"
                                });
                            } else {
                                // Create the user-object
                                const user = {
                                    mail: req.body.mail,
                                    password: hash
                                }

                                // Save the user to the database
                                User.create(user)
                                    .then(data => {
                                        res.status(201).json(data);
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            message: "Internal error occured while creating the user"
                                        });
                                    });
                            }
                        });
                    }
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Internal error occured while checking the given mail"
                    });
                });
        }
    } else {
        res.status(401).json({
            message: "Auth failed"
        });
    }
};