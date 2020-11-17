const he = require("he");
const db = require("../models");
const List = db.lists;
const Board = db.boards;
const Shared_Board = db.shared_boards;
const Op = db.Sequelize.Op;

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

exports.delete = (req, res) => {
    const list_id = req.params.list_id;
    if (!list_id){
        res.status(400).json({
            message: "list_id cannot be empty"
        });
    } else {
        req.userData.list_id = list_id;
        checkListPerm(req, res, () => {
            List.destroy({ where: { id: list_id }})
                .then(num => {
                    if (num == 1){
                        res.status(200).json({
                            message: "List deleted successfully"
                        });
                    } else {
                        res.status(404).json({
                            message: "A list with the specified id was not found"
                        });
                    }
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Internal error occured while deleting list"
                    });
                });
        });
    }
};

exports.updateOrder = (req, res) => {
    const list_id = req.body.id;
    const upper_list_id = req.body.upperId;
    if (!list_id || !upper_list_id){
        res.status(400).json({
            message: "id or upperId cannot be empty"
        });
    } else {
        req.userData.list_id = list_id;
        checkListPerm(req, res, () => { // Check permission of list to be moved
            req.userData.list_id = upper_list_id;
            checkListPerm(req, res, () => { // Check permission of upper list
                List.findAll({ where: { board_id: req.userData.board_id }})
                    .then(data => {
                        console.log(data);
                        if (upper_list_id != -1){
                            var upper_list_nr = data.find(list => {
                                return list.id == upper_list_id;
                            }).order_number;
                            List.increment({ order_number: 1 }, { where: {board_id: req.userData.board_id, id: { [Op.ne]: list_id }, order_number: { [Op.gt]: upper_list_nr }}})
                                .then(data => {
                                    console.log(list_id);
                                    console.log(upper_list_nr);
                                    List.update({order_number: upper_list_nr + 1}, {where: {id: list_id}})
                                        .then(data => {
                                            res.status(200).json({
                                                message: "Order changed successfully"
                                            });
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                message: "Internal error occured while updating order number"
                                            });
                                        });
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        message: "Internal error occured while updating order numbers"
                                    });
                                });
                        } else {
                            List.increment({ order_number: 1}, { where: {board_id: req.userData.board_id, id: { [Op.ne]: list_id }}})
                                .then(data => {
                                    List.update({order_number: 1}, {where: {id: list_id}})
                                        .then(data => {
                                            res.status(200).json({
                                                message: "Order changed successfully"
                                            });
                                        })
                                        .catch(err => {
                                            res.status(500).json({
                                                message: "Internal error occured while updating order number"
                                            });
                                        });
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        message: "Internal error occured while setting list to top"
                                    });
                                });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            message: "Internal error occured while getting lists"
                        })
                    });
            });
        });
    }
};

function checkListPerm(req, res, next) {
    if (req.userData.list_id != -1){
        List.findByPk(req.userData.list_id)
        .then(data => {
            if (!data.board_id) {
                res.status(404).json({
                    message: `A list with the specified id "${req.body.list_id}" was not found`
                });
            } else {
                var board_id = data.board_id;
                req.userData.board_id = board_id;
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
    } else {
        next();
    }
}