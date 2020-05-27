const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSOWRD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorAliases: false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

var User = require("./user.model.js")(sequelize, Sequelize);
var Board = require("./board.model.js")(sequelize, Sequelize);
var Category = require("./category.model.js")(sequelize, Sequelize);

User.hasMany(Board, {
    foreignKey: "owner_id"
});
Board.belongsTo(User, {
    foreignKey: "owner_id"
});

User.hasMany(Category, {
    foreignKey: "owner_id"
});
Category.belongsTo(User, {
    foreignKey: "owner_id"
});

Category.hasMany(Board, {
    foreignKey: "category_id"
});
Board.belongsTo(Category, {
    foreignKey: "category_id"
})

const db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    users: User,
    boards: Board,
    categories: Category
};

module.exports = db;