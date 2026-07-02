const express = require("express");
const router  = express.Router();
const {
  getPeriods,
  getOrCreatePeriod,
  getPeriodWithExpenses,
  saveExpenses,
  finalizePeriod,
} = require("../controllers/expenseController");

router.get("/periods",             getPeriods);
router.post("/periods",            getOrCreatePeriod);
router.get("/periods/:id",         getPeriodWithExpenses);
router.put("/periods/:id",         saveExpenses);
router.patch("/periods/:id/finalize", finalizePeriod);

module.exports = router;
