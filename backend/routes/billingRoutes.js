const express = require("express");
const router  = express.Router();
const {
  getPeriods,
  getOrCreatePeriod,
  getPeriodWithBills,
  getPreviousReadings,
  saveBills,
  saveExpenses,
  publishPeriod,
  getPrintData,
} = require("../controllers/billingController");

router.get("/periods",                  getPeriods);
router.post("/periods",                 getOrCreatePeriod);
router.get("/periods/:id",              getPeriodWithBills);
router.put("/periods/:id/bills",        saveBills);
router.put("/periods/:id/expenses",     saveExpenses);
router.patch("/periods/:id/publish",    publishPeriod);
router.get("/periods/:id/print",        getPrintData);
router.get("/previous-readings",        getPreviousReadings);

module.exports = router;
