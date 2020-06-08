const db = require("../models");
const checkBoardPerm = require("../middleware/check-perm-board.js");
const Listentry = db.listentries;
const List = db.lists;
const Board = db.boards;
const Shared_Board = db.shared_boards;


// Create a new listentry
exports.create = (req, res) => {
    if (!req.body.list_id || !req.body.title) {
        res.status(400).json({
            message: "list_id or title cannot be empty"
        });
    } else {
        List.findByPk(req.body.list_id)
            .then(data  => {
                if (!data.board_id) {
                    res.status(404).json({
                        message: `A list with the specified id "${req.body.list_id}" was not found`
                    });
                } else {
                    checkListPerm(req, res, () => {
                        const list_id = req.body.list_id;
                        const title = req.body.title;
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
                            })
                    })
                }
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal error occured while getting list data"
            });
        });
    }
};

exports.findAllByListId = (req, res) => {

}

function checkListPerm(req, res, next) {
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