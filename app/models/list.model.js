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
        }
    });

    return List;
}