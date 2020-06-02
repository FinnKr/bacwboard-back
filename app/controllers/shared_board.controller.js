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
        User.findAll({ where: { mail: req.body.shared_user_mail }})
        .then(data => {
            if (data.length < 1) {
                res.status(404).json({
                    message: `A user with the given mail: ${req.body.shared_user_mail} does not exist`
                });
            } else {
                const shared_board = {
                    board_id: req.body.board_id,
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
};

exports.findAllBySharedId = (req, res) => {
    Shared_Board.findAll({ where: { shared_user_id: req.userData.userid }, include: [{ model: Board, include: [User, Category] }]})
        .then(data => {
            var res_data = [];
            data.forEach(el => {
                const el_new = {
                    category: {
                        name: el.board.category.name,
                    },
                    id: el.board_id,
                    title: el.board.title,
                    category_id: el.board.category_id
                }
                res_data.push(el_new);
            });
            res.status(200).json(res_data);
        })
        .catch(err => {
            console.log(err);
            
            res.status(500).json({
                message: "Internal server error occured while getting Shared Board data"
            });
        });
}

function createSharedBoard(shared_user_mail, board_id, res) {
    
}