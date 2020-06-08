module.exports = app => {
    const lists = require("../controllers/list.controller.js");
    const listentries = require("../controllers/listentry.controller.js");
    const checkAuth = require("../middleware/check-auth.js");
    const checkBoardPerm = require("../middleware/check-perm-board.js");
    var router = require("express").Router();

    // Create a shared board (Share a board)
    router.post("/", checkAuth, checkBoardPerm, lists.create);

    // Get all shared boards
    router.get("/:board_id(\\d+)", checkAuth, checkBoardPerm, lists.findAllByBoardId);

    app.use("/list", router);
}