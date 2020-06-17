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
                    List.findAll({ where: { board_id: list.board_id }})
                        .then(data => {
                            list.order_number = data.length + 1;
                            List.create(list)
                                .then(data => {
                                    res.status(201).json(data);
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        message: "Internal error occured while creating new list"
                                    });
                                });
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "Internal error occured while fetching lists"
                            });
                        });
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

exports.editTitle = (req, res) => {
    if (!req.body.title.trim() || !req.params.list_id){
        res.status(400).json({
            message: "Title or list_id cannot be empty"
        });
    } else {
        req.userData.list_id = req.params.list_id;
        checkListPerm(req, res, () => {
            List.update({ title: he.encode(req.body.title) }, { where : { id: req.params.list_id }})
                .then(data => {
                    res.status(200).json(data);
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Internal error occured while updating list title"
                    });
                });
        });
    }
};

function checkListPerm(req, res, next) {
    List.findByPk(req.userData.list_id)
        .then(data => {
            if (!data.board_id) {
                res.status(404).json({
                    message: `A list with the specified id "${req.body.list_id}" was not found`
                });
            } else {
                var board_id = data.board_id;
                Board.findByPk(board_id)
                    .then(board_data => {
                        if (!board_data) {
                            res.status(404).json({
                                message: `A board with specified ID: ${board_id} was not found`
                            });
                        } else if (board_data.owner_id != req.userData.userid){
                            Shared_Board.findAll({ where: { shared_user_id: req.userData.userid, board_id: board_id}})
                                .then(shared_board_data => {
                                    if (shared_board_data.length < 1) {
                                        res.status(401).json({
                                            message: "Auth failed"
                                        });
                                    } else {
                                        next();
                                    }
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        message: "Internal server error occured while checking shared_board data"
                                    });
                                });
                        } else {
                            next();
                        }
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "Internal server error occured while getting board information"
                        });
                    });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal error occured while getting list data"
            });
        });
}