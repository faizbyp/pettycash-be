const express = require("express");
const isAuth = require("../middleware/auth");
const {
  handlePostPO,
  handleGetPOByUser,
  handleGetPOById,
  handleGetAllPO,
  handlePOApproval,
  handleReqCancelPO,
  handleCancelPO,
} = require("../controllers/POController");
const router = express.Router();

router.post("/", handlePostPO);
router.get("/", handleGetAllPO);
router.patch("/approval/:id_po", handlePOApproval);
router.get("/user/:id_user", handleGetPOByUser);
router.get("/:id_po", handleGetPOById);
router.patch("/req-cancel/:id_po", handleReqCancelPO);
router.patch("/cancel/:id_po", handleCancelPO);

module.exports = router;
