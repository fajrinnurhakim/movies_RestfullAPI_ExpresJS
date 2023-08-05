const express = require("express");
const router = express.Router();
const authRouter = require("./auth.js");
const movies = require("./movies.js");
const users = require("./users.js");
const { authentication } = require("../middlewares/auth.js");

router.use("/auth", authRouter);
router.use(authentication);
// authentication
router.use("/movies", movies);
router.use("/users", users);

module.exports = router;
