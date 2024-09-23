const express = require("express");
const {
  handlePostPO,
  handleGetPOByUser,
  handleGetPOById,
  handleGetAllPO,
  handlePOApproval,
} = require("../controllers/POController");
const isAuth = require("../middleware/auth");
const router = express.Router();

router.post("/", isAuth, handlePostPO);
router.get("/", isAuth, handleGetAllPO);
router.patch("/approval/:id_po", isAuth, handlePOApproval);
router.get("/user/:id_user", isAuth, handleGetPOByUser);
router.get("/:id_po", isAuth, handleGetPOById);

module.exports = router;
