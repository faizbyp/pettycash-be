const express = require("express");
const {
  handlePostPO,
  handleGetPOByUser,
  handleGetPOById,
  handleGetAllPO,
} = require("../controllers/POController");
const router = express.Router();

router.post("/", handlePostPO);
router.get("/", handleGetAllPO);
router.get("/user/:id_user", handleGetPOByUser);
router.get("/:id_po", handleGetPOById);

module.exports = router;
