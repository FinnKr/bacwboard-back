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
            type: Sequelize.TEXT,
            allowNull: false
        },
        order_number: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT
        },
        due_date: {
            type: Sequelize.DATE
        }
    });

    return Listentry;
}