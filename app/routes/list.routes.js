module.exports = app => {
    const lists = require("../controllers/list.controller.js");
    const listentries = require("../controllers/listentry.controller.js");
    const checkAuth = require("../middleware/check-auth.js");
    const checkBoardPerm = require("../middleware/check-perm-board.js");
    var router = require("express").Router();

    // Create a new list
    router.post("/", checkAuth, checkBoardPerm, lists.create);

    // Get all lists from board
    router.get("/:board_id(\\d+)", checkAuth, checkBoardPerm, lists.findAllByBoardId);

    // Change list title
    router.put("/:list_id(\\d+)", checkAuth, lists.editTitle);

    // Delete list
    router.delete("/:list_id(\\d+)", checkAuth, lists.delete);

    // Create a listentry
    router.post("/entry", checkAuth, listentries.create);

    // Get all listentries by list_id
    //router.get("/entry/:list_id(\\d+)", checkAuth, listentries.findAllByListId);

    // Change order of listentry
    router.put("/entry/changeorder", checkAuth, listentries.updateOrder);

    // Get a single listentry by id
    router.get("/entry/:id(\\d+)", checkAuth, listentries.findOne);

    // Get all listentries by board id (in query string)
    router.get("/entry", checkAuth, checkBoardPerm, listentries.findAllByBoardId);

    // Change title and/or description of listentry
    router.put("/entry/:id(\\d+)", checkAuth, listentries.update);

    // Delete listentry by id
    router.delete("/entry/:id(\\d+)", checkAuth, listentries.delete);

    app.use("/list", router);
}