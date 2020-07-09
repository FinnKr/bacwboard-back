// Loading all models and defining relations between them

// imports
const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

// Creating the Sequelize object to connect to database
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

// importing all models
var User = require("./user.model.js")(sequelize, Sequelize);
var Board = require("./board.model.js")(sequelize, Sequelize);
var Category = require("./category.model.js")(sequelize, Sequelize);
var Shared_Board = require("./shared_board.model.js")(sequelize, Sequelize);
var List = require("./list.model.js")(sequelize, Sequelize);
var Listentry = require("./listentry.model.js")(sequelize, Sequelize);

// Defining relations between the models (entity-types in database)
User.hasMany(Board, {               // User     Board
    foreignKey: "owner_id"          // 1    to  Many
});
Board.belongsTo(User, {
    foreignKey: "owner_id"
});

User.hasMany(Category, {            // User     Category
    foreignKey: "owner_id"          // 1    to  Many
});
Category.belongsTo(User, {
    foreignKey: "owner_id"
});

Category.hasMany(Board, {           // Category  Board
    foreignKey: "category_id"       // 1    to  Many
});
Board.belongsTo(Category, {
    foreignKey: "category_id"
})

User.hasMany(Shared_Board, {        // User     Shared_Board
    foreignKey: "shared_user_id"    // 1    to  Many
});
Shared_Board.belongsTo(User, {
    foreignKey: "shared_user_id"
});

Board.hasMany(Shared_Board, {       // Board    Shared_Board
    foreignKey: "board_id"          // 1    to  Many
});
Shared_Board.belongsTo(Board, {
    foreignKey: "board_id"
});

Board.hasMany(List, {               // Board    List
    foreignKey: "board_id"          // 1    to  Many
});
List.belongsTo(Board, {
    foreignKey: "board_id"
});

List.hasMany(Listentry, {           // List     Listentry
    foreignKey: "list_id"           // 1    to  Many
});
Listentry.belongsTo(List, {
    foreignKey: "list_id"
});

const db = {                        // Object for accessing Sequelize objects and models later on
    Sequelize: Sequelize,
    sequelize: sequelize,
    users: User,
    boards: Board,
    categories: Category,
    shared_boards: Shared_Board,
    lists: List,
    listentries: Listentry
};
module.exports = db;    