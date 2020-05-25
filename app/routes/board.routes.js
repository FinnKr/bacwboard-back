module.exports = app => {
    const boards = require("../controllers/board.controller.js");
    const checkAuth = require("../middleware/check-auth.js");
    var router = require("express").Router();

    // Create a board
    router.post("/", checkAuth, boards.create);

    app.use("/board", router);
}