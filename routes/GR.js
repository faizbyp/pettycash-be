const express = require("express");
const {
  handlePostGR,
  handleGetGRByUser,
  handleGetRemainingItem,
  handleGetPOForGR,
} = require("../controllers/GRController");
const router = express.Router();

router.post("/", handlePostGR);
router.get("/user/:id_user", handleGetGRByUser);
router.get("/remaining", handleGetRemainingItem);
router.get("/po/:id_po", handleGetPOForGR);

module.exports = router;
