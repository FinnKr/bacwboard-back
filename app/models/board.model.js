module.exports = (sequelize, Sequelize) => {
    const Board = sequelize.define("board", {
        owner_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "users",
                key: "id"
            },
            allowNull: false
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        category_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "categories",
                key: "id"
            },
            allowNull: false
        }
    });

    return Board;
}