module.exports = (sequelize, Sequelize) => {
    const List = sequelize.define("list", {
        board_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "boards",
                key: "id"
            },
            allowNull: false
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        order_number: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

    return List;
}