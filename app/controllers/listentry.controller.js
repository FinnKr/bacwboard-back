const db = require("../models");
const he = require("he");
const Listentry = db.listentries;
const List = db.lists;
const Board = db.boards;
const Shared_Board = db.shared_boards;
const Op = db.Sequelize.Op;


// Create a new listentry
exports.create = (req, res) => {
    if (!req.body.list_id || !req.body.title) {
        res.status(400).json({
            message: "list_id or title cannot be empty"
        });
    } else {
        const list_id = req.body.list_id;
        req.userData.list_id = list_id;
        checkListPerm(req, res, () => {
            const title = he.encode(req.body.title);
            Listentry.findAll({ where: { list_id: list_id }})
                .then(data => {
                    const order_number = data.length;
                    const listentry = {
                        list_id: list_id,
                        order_number: order_number,
                        title: title
                    };
                    Listentry.create(listentry)
                        .then(data => {
                            res.status(201).json(data);
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "Internal error occured while creating the listentry"
                            });
                        });
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Internal error occured while creating the listentry"
                    })
                });
        });
    }
};

exports.findAllByListId = (req, res) => {
    const list_id = req.params.list_id;
    if (!list_id) {
        res.status(400).json({
            message: "list_id cannot be empty"
        });
    } else {
        req.userData.list_id = list_id;
        checkListPerm(req,res, () => {
            Listentry.findAll({ where: { list_id: list_id }})
                .then(data => {
                    res.status(200).json(data);
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Internal error occured while getting listentries"
                    });
                })
        });
    }
}

exports.findAllByBoardId = (req, res) => {
    const board_id = req.query.board_id;
    if (!board_id) {
        res.status(400).json({
            message: "board_id cannot be empty"
        });
    } else {
        List.findAll({ where: { board_id: board_id }, attributes: ["id"] })
            .then(listids_raw => {
                var listids = listids_raw.map(el => el.id);
                Listentry.findAll({ where: { list_id: { [Op.in]: listids }}})
                    .then(data => {
                        res.status(200).json(data);
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "Internal error occured while getting listentries"
                        });
                    });
            })
            .catch(err => {
                res.status(500).json({
                    message: "Internal error occured while getting List data"
                })
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