const express = require("express");
const { handlePostPO, handleGetPOByUser } = require("../controllers/POController");
const router = express.Router();

router.post("/", handlePostPO);
router.get("/user/:id_user", handleGetPOByUser);
// router.get("/:id_po", handleGetCompanyById);

module.exports = router;
