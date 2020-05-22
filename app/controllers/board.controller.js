const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const constants = require("../config/constants.js");
const User = db.users;
const Op = db.Sequelize.Op;

