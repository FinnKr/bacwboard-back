module.exports = app => {
    const shared_boards = require("../controllers/shared_board.controller.js");
    const checkAuth = require("../middleware/check-auth.js");
    var router = require("express").Router();

    // Create a shared board (Share a board)
    router.post("/", checkAuth, shared_boards.create);

    // Get all shared boards
    router.get("/", checkAuth, shared_boards.findAllBySharedId);

    app.use("/share", router);
}