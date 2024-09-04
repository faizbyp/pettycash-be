const express = require("express");
const { handlePostPO } = require("../controllers/POController");
const router = express.Router();

router.post("/", handlePostPO);
// router.get("/:id_po", handleGetCompanyById);

module.exports = router;
