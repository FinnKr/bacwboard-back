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
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        category: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    
    return Board;
}