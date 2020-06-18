module.exports = app => {
    const boards = require("../controllers/board.controller.js");
    const checkAuth = require("../middleware/check-auth.js");
    const checkPerm = require("../middleware/check-perm-board.js");
    var router = require("express").Router();

    // Change the title of an existing board
    router.put("/:board_id(\\d+)", checkAuth, checkPerm, boards.editTitle);

    // Delete board by id
    router.delete("/:board_id(\\d+)", checkAuth, checkPerm, boards.delete)

    // Create a board
    router.post("/", checkAuth, boards.create);

    // Get all boards from user
    router.get("/", checkAuth, boards.findAllByOwner);

    app.use("/board", router);
}