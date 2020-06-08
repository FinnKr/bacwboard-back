module.exports = (sequelize, Sequelize) => {
    const Listentry = sequelize.define("listentry", {
        list_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "lists",
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

    return Listentry;
}