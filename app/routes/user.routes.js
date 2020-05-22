module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const checkAuth = require("../middleware/check-auth.js");
    var router = require("express").Router();

    // Create a user
    router.post("/", checkAuth, users.create);

    app.use("/user", router);
}