const db = require("../models");
const Board = db.boards;
const Shared_Board = db.shared_boards;

module.exports = (req, res, next) => {
    var board_id;
    if (req.body.board_id){
        board_id = req.body.board_id;
    } else if (req.params.board_id){
        board_id = req.params.board_id;
    }
        Board.findByPk(board_id)
            .then(board_data => {
                if (!board_data) {
                    res.status(404).json({
                        message: `A board with specified ID: ${board_id} was not found`
                    });
                } else if (!req.userData.userid) {
                    res.status(401).json({
                        message: "Auth failed"
                    });
                }else if (board_data.owner_id != req.userData.userid){
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