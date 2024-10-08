const express = require("express");
const isAuth = require("../middleware/auth");
const {
  handlePostPO,
  handleGetPOByUser,
  handleGetPOById,
  handleGetAllPO,
  handlePOApproval,
} = require("../controllers/POController");
const router = express.Router();

router.post("/", handlePostPO);
router.get("/", handleGetAllPO);
router.patch("/approval/:id_po", handlePOApproval);
router.get("/user/:id_user", handleGetPOByUser);
router.get("/:id_po", handleGetPOById);

module.exports = router;
