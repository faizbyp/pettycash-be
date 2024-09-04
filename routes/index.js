const express = require("express");
const router = express.Router();
const Company = require("./Company");
const Vendor = require("./Vendor");
const UOM = require("./UOM");
const PO = require("./PO");
// import controllers here
const Example = require("../controllers/ExampleController");

// @ using router
// router.use('/api/<endpoint>', <controller>)
router.use("/api/company", Company);
router.use("/api/vendor", Vendor);
router.use("/api/uom", UOM);
router.use("/api/po", PO);

router.use("/api", (req, res) => {
  res.status(200).send({
    message: "Welcome to Petty Cash API",
  });
});

router.get("/api/example", Example.exampleMethod);

module.exports = router;
