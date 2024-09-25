const express = require("express");
const { handlePostGR } = require("../controllers/GRController");
const router = express.Router();

router.post("/", handlePostGR);

module.exports = router;
