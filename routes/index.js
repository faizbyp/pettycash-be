const express = require("express");
const router = express.Router();
const Company = require("./Company");
const Vendor = require("./Vendor");
const UOM = require("./UOM");
const PO = require("./PO");
const GR = require("./GR");
const User = require("./User");
const Report = require("./Report");
// import controllers here
const Example = require("../controllers/ExampleController");

// @ using router
// router.use('/be-api/<endpoint>', <controller>)
router.use("/be-api/company", Company);
router.use("/be-api/vendor", Vendor);
router.use("/be-api/uom", UOM);
router.use("/be-api/po", PO);
router.use("/be-api/gr", GR);
router.use("/be-api/user", User);
router.use("/be-api/report", Report);

router.use("/be-api", (req, res) => {
  res.status(200).send({
    message: "Welcome to Petty Cash API",
  });
});

router.get("/be-api/example", Example.exampleMethod);

module.exports = router;
