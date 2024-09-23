const express = require("express");
const { handleGetAllUOM, handleAddUOM } = require("../controllers/UOMController");
const isAuth = require("../middleware/auth");
const router = express.Router();

router.get("/", isAuth, handleGetAllUOM);
router.post("/", isAuth, handleAddUOM);

module.exports = router;
