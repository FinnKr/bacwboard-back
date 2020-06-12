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

    // Create a listentry
    router.post("/entry", checkAuth, listentries.create);       // CHECK IF BOARD PERM!!!!

    // Get all listentries by list_id
    router.get("/entry/:list_id(\\d+)", checkAuth, listentries.findAllByListId);

    // Get all listentries by board id (in query string)
    router.get("/entry", checkAuth, checkBoardPerm, listentries.findAllByBoardId);

    // Change order of listentry
    router.put("/entry/changeorder", checkAuth, listentries.updateOrder);

    app.use("/list", router);
}