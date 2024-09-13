const express = require("express");
const { handleGetAllUOM, handleAddUOM } = require("../controllers/UOMController");
const router = express.Router();

router.get("/", handleGetAllUOM);
router.post("/", handleAddUOM);

module.exports = router;
