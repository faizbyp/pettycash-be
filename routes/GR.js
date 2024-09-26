const express = require("express");
const {
  handlePostGR,
  handleGetGRByUser,
  handleGetRemainingItem,
} = require("../controllers/GRController");
const router = express.Router();

router.post("/", handlePostGR);
router.get("/user/:id_user", handleGetGRByUser);
router.get("/remaining", handleGetRemainingItem);

module.exports = router;
