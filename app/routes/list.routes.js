module.exports = app => {
    const lists = require("../controllers/list.controller.js");
    const checkAuth = require("../middleware/check-auth.js");
    const checkBoardPerm = require("../middleware/check-perm-board.js");
    var router = require("express").Router();

    // Create a shared board (Share a board)
    router.post("/", checkAuth, checkBoardPerm, lists.create);

    // Get all shared boards
    router.get("/", checkBoardPerm, checkAuth, lists.findAllByBoardId);

    app.use("/list", router);
}