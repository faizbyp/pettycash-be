const express = require("express");
const { handleGetAllUOM } = require("../controllers/UOMController");
const router = express.Router();

router.get("/", handleGetAllUOM);

module.exports = router;
