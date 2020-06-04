const he = require("he");
const db = require("../models");
const constants = require("../config/constants.js");
const Board = db.boards;
const Category = db.categories;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    if (!req.body.title || !req.body.category) {
        res.status(400).json({
            message: "title or category can not be empty!"
        });
    } else {
        const userid = req.userData.userid;
        Board.findAll({ where: { title: req.body.title, owner_id: userid } })
            .then(data => {
                if (data.length >= 1) {
                    res.status(422).json({
                        message: `Board "${req.body.title}" already exists`
                    });
                } else {
                    const category_name = he.encode(req.body.category);
                    const title = he.encode(req.body.title);
                    var category_id;
                    Category.findAll({ where: { owner_id: userid, name: category_name } })
                        .then(data => {
                            if (data.length < 1) {
                                const category = {
                                    owner_id: userid,
                                    name: category_name
                                }
                                Category.create(category)
                                    .then(data => {
                                        category_id = data.id;
                                        createBoard(userid, title, category_id, res);
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            message: "Internal error occured while creating the category"
                                        });
                                    });
                            } else {
                                category_id = data[0].id;
                                createBoard(userid, title, category_id, res);
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "Internal error occured while checking the category"
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

exports.findAllByOwner = (req, res) => {
    Board.findAll({ where: { owner_id: req.userData.userid }, include: [Category] })
        .then(board_data => {
            res.status(200).json(board_data);
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal server error occured while getting boards"
            });
        });
}

function createBoard(userid, title, category_id, res) {
    const board = {
        owner_id: userid,
        title: title,
        category_id: category_id
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