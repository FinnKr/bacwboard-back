const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./app/models");
const PORT = process.env.PORT || 8081;
const app = express();

var corsOptions = {
    origin: "*"
}

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.status(200).json({ message: "Base route" });
});

db.sequelize.sync();
//db.sequelize.sync({ force: true }).then(() => {
//    console.log("Dropped and resynced database.");
//});

require("./app/routes/user.routes.js")(app);
require("./app/routes/board.routes.js")(app);
require("./app/routes/shared_board.routes.js")(app);
require("./app/routes/list.routes.js")(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});