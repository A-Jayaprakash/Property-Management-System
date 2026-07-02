const express = require("express");
const router  = express.Router();
const { getOverallReport, getPropertyReport, getUnitReport } = require("../controllers/reportController");

router.get("/overall",        getOverallReport);
router.get("/property/:id",   getPropertyReport);
router.get("/unit/:id",       getUnitReport);

module.exports = router;
