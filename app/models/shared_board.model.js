module.exports = (sequelize, Sequelize) => {
    const Shared_Board = sequelize.define("shared_board", {
        shared_user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "users",
                key: "id"
            },
            allowNull: false
        },
        board_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "boards",
                key: "id"
            },
            allowNull: false
        }
    });

    return Shared_Board;
}