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
                            title: req.sanitize(req.body.title),
                            category: req.sanitize(req.body.category)
                        }

                        Board.create(board)
                            .then(data => {
                                res.status(201).json(data);
                            })
                            .catch(err => {
                                if (err instanceof db.Sequelize.ForeignKeyConstraintError) {
                                    res.status(401).json({
                                        message: "Auth failed"
                                    });
                                } else {
                                    res.status(500).json({
                                        message: "Internal error occured while creating the board"
                                    });
                                }
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

exports.findAllByOwner = (req, res) => {
    Board.findAll({ where: { owner_id: req.userData.userid }})
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal server error occured while getting boards"
            });
        });
}