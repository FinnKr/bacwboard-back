const db = require("../models");
const constants = require("../config/constants.js");
const Board = db.boards;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
        if (!req.body.title || !req.body.category){
            res.status(400).json({
                message: "ownerid, title or category can not be empty!"
            });
        } else {
            Board.findAll({ where: { title: req.body.title }})
                .then(data => {
                    if (data.length >= 1) {
                        res.status(422).json({
                            message: `Board "${req.body.title}" already exists`
                        });
                    } else {
                        const board = {
                            owner_id: req.userData.userid,
                            title: req.body.title,
                            category: req.body.category
                        }

                        Board.create(board)
                            .then(data => {
                                res.status(201).json(data);
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: "Internal error occured while creating the board"
                                });
                            });
                    }
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Internal error occured while checking the given title"
                    });
                });
        }
};