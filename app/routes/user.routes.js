module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const checkAuth = require("../middleware/check-auth.js");
    var router = require("express").Router();

    // Create a user
    router.post("/signup", checkAuth, users.create);

    // Login to an existing user
    router.post("/login", users.login);

    // Check authorization
    router.get("/auth", checkAuth, users.getAuth);

    app.use("/user", router);
}