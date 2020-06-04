const he = require("he");
const db = require("../models");
const List = db.lists;
const Board = db.boards;

exports.create = (req, res) => {
    if (!req.body.title || !req.body.board_id){
        res.status(400).json({
            message: "title or board_id can not be empty"
        });
    } else {
        List.findAll({ where: { title: req.body.title, board_id: req.body.board_id }})
            .then(data => {
                if (data.length >= 1) {
                    res.status(422).json({
                        message: `List "${req.body.title}" already exists in current board`
                    });
                } else {
                    const list = {
                        title: he.encode(req.body.title),
                        board_id: req.body.board_id
                    }
                    List.create(list)
                        .then(data => {
                            res.status(201).json(data);
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "Internal error occured while creating new list"
                            });
                        })
                }
            })
            .catch(err => {
                res.status(500).json({
                    message: "Internal error occured while checking for list duplicates"
                });
            });
    }
};

exports.findAllByBoardId = (req, res) => {
    if (!req.params.board_id) {
        res.status(400).json({
            message: "board_id cannot be empty"
        });
    } else {
        List.findAll({ where: { board_id: req.params.board_id }})
            .then(data => {
                Board.findByPk(req.params.board_id)
                    .then(board_data => {
                        data.push({board_title: board_data.title, board_id: board_data.id});
                        res.status(200).json(data);
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "Internal error occured while fetching board data"
                        });
                    });
            })
            .catch(err => {
                res.status(500).json({
                    message: "Internal error occured while getting lists"
                });
            });
    }
};