const db = require("../models");
const Board = db.boards;
const Category = db.categories;
const Shared_Board = db.shared_boards;
const User = db.users;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    if (!req.body.shared_user_mail || !req.body.board_id) {
        res.status(400).json({
            message: "Shared user mail or board id cannot be empty"
        });
    } else {
        Board.findByPk(req.body.board_id)
            .then(board_data => {
                if (board_data.length < 1) {
                    res.status(404).json({
                        message: `A board with specified ID: ${req.body.board_id} was not found`
                    });
                } else if (board_data.owner_id != req.userData.userid){
                    Shared_Board.findAll({ where: { shared_user_id: req.userData.userid, board_id: req.body.board_id}})
                        .then(shared_board_data => {
                            if (shared_board_data.length < 1) {
                                res.status(401).json({
                                    message: "Auth failed"
                                });
                            } else {
                                createSharedBoard(req.body.shared_user_mail, req.body.board_id);
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "Internal server error occured while checking shared_board data"
                            });
                        });
                } else {
                    createSharedBoard(req.body.shared_user_mail, req.body.board_id)
                }
            })
            .catch(err => {
                res.status(500).json({
                    message: "Internal server error occured while"
                });
            });
    }
};

function createSharedBoard(shared_user_mail, board_id) {
    User.findAll({ where: { mail: shared_user_mail }})
        .then(data => {
            if (data.length < 1) {
                res.status(404).json({
                    message: `A user with the given mail: ${shared_user_mail} does not exist`
                });
            } else {
                const shared_board = {
                    board_id: board_id,
                    shared_user_id: data[0].id
                }
                Shared_Board.create(shared_board)
                    .then(shared_board_created_data => {
                        res.status(201).json(shared_board_created_data);
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: "Internal server error occured while creating the shared_board"
                        });
                    });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Internal server error occured while resolving the given mail"
            });
        });
}