module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define("category", {
        owner_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "users",
                key: "id",
            },
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    return Category;
}