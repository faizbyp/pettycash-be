const express = require("express");
const ItemController = require("../controllers/itemController");
const router = express.Router();

router.get("/", ItemController.getAll);

module.exports = router;
