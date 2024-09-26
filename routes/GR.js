const express = require("express");
const { handlePostGR, handleGetGRByUser } = require("../controllers/GRController");
const router = express.Router();

router.post("/", handlePostGR);
router.get("/user/:id_user", handleGetGRByUser);

module.exports = router;
