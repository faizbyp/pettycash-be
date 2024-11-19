const express = require("express");
const {
  handlePostPO,
  handleGetPOByUser,
  handleGetPOById,
  handleGetAllPO,
  handlePOApproval,
  handleReqCancelPO,
  handleCancelPO,
  handleEditPO,
} = require("../controllers/POController");
const { isAdmin } = require("../middleware/auth");
const router = express.Router();

router.post("/", handlePostPO);
router.get("/", handleGetAllPO);
router.patch("/approval/:id_po", handlePOApproval);
router.get("/user/:id_user", handleGetPOByUser);
router.get("/:id_po", handleGetPOById);
router.patch("/req-cancel/:id_po", handleReqCancelPO);
router.patch("/cancel/:id_po", handleCancelPO);
router.patch("/edit/:id_po", handleEditPO);

module.exports = router;
