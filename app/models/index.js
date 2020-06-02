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
var Shared_Board = require("./shared_board.model.js")(sequelize, Sequelize);
var List = require("./list.model.js")(sequelize, Sequelize);

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

User.hasMany(Shared_Board, {
    foreignKey: "shared_user_id"
});
Shared_Board.belongsTo(User, {
    foreignKey: "shared_user_id"
});

Board.hasMany(Shared_Board, {
    foreignKey: "board_id"
});
Shared_Board.belongsTo(Board, {
    foreignKey: "board_id"
});

Board.hasMany(List, {
    foreignKey: "board_id"
});
List.belongsTo(Board, {
    foreignKey: "board_id"
})

const db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    users: User,
    boards: Board,
    categories: Category,
    shared_boards: Shared_Board,
    lists: List
};

module.exports = db;