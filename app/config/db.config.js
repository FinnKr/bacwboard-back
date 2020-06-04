module.exports = {
    HOST: "berlin-fn.de",
    USER: "bacw",
    PASSOWRD: "efuihweufh78",
    DB: "bacwboard",
    dialect: "mysql",
    pool: {
        max: 5,         // maximum of 5 open connections
        min: 0,         // no minimum of open connections
        acquire: 30000, // maximum of 30 seconds to open a connection
        idle: 10000     // connection closes after 10 seconds of being idle
    }
}