const he = require("he");
const db = require("../models");
const Board = db.boards;
const Category = db.categories;
const List = db.lists;
const Listentry = db.listentries;
const SharedBoard = db.shared_boards;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    if (!req.body.title.trim() || !req.body.category.trim()) {
        res.status(400).json({
            message: "title or category can not be empty!"
        });
    } else {
        const userid = req.userData.userid;
        const title = he.encode(req.body.title.trim());
        const category_name = he.encode(req.body.category.trim());
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
                    Board.findAll({ where: {title: title, owner_id: userid, category_id: category_id }})
                        .then(data => {
                            if (data.length >= 1) {
                                res.status(422).json({
                                    message: `Board "${title}" already exists`
                                });
                            } else {
                                createBoard(userid, title, category_id, res);
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "Internal error occured while checking for duplicates"
                            });
                        });
                }
            })
            .catch(err => {
                res.status(500).json({
                    message: "Internal error occured while checking the category"
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

exports.editTitle = (req, res) => {
    if (!req.body.title.trim()){
        res.status(400).json({
            message: "Title cannot be empty"
        });
    } else {
        Board.findAll({ where: { title: req.body.title, id: req.params.board_id }})
            .then(data => {
                if (data.length > 0){
                    res.status(304).json({
                        message: "Title not changed"
                    });
                } else {
                    Board.update({ title: he.encode(req.body.title) }, { where: { id: req.params.board_id }})
                        .then(data => {
                            res.status(200).json(data);
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "Internal error occured while updating the board title"
                            });
                        });
                }
            })
            .catch(err => {
                res.status(500).json({
                    message: "Internal error while checking for modification"
                });
            });
    }
}

exports.delete = (req, res) => {
    const board_id = req.params.board_id;
    if (!req.params.board_id){
        res.status(400).json({
            message: "Board id cannot be empty"
        });
    } else {
        SharedBoard.destroy({ where: { board_id: board_id }})
            .then(num => {
                List.findAll({ where: { board_id: board_id }, attributes: ["id"] })
                    .then(data => {
                        var listids = data.map(el => el.id);
                        Listentry.destroy({ where: { list_id: { [Op.in]: listids }}})
                            .then(num => {
                                List.destroy({ where: { board_id: board_id }})
                                    .then(num => {
                                        Board.destroy({ where: { id: board_id }})
                                            .then(num => {
                                                if (num == 1){
                                                    res.status(200).json({
                                                        message: "Board deleted successfully"
                                                    });
                                                } else {
                                                    res.status(404).json({
                                                        message: "A board with the specified id does not exist"
                                                    });
                                                }
                                            })
                                            .catch(err => {
                                                res.status(500).json({
                                                    message: "Internal error occcured while deleting Board"
                                                });
                                            });
                                    })
                                    .catch(err => {
                                        res.status(500).json({
                                            message: "Internal error occcured while deleting Lists"
                                        });
                                    });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: "Internal error occcured while deleting Listentries"
                                });
                            });
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "Internal error occcured while getting List data"
                        });
                    });
            })
            .catch(err => {
                res.status(500).json({
                    message: "Internal error occcured while deleting Shared_boards"
                });
            });
    }
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