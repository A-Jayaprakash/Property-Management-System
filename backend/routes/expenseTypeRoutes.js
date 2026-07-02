const express = require("express");
const router  = express.Router();
const { getExpenseTypes, createExpenseType, updateExpenseType, deleteExpenseType } = require("../controllers/expenseTypeController");

router.get("/",    getExpenseTypes);
router.post("/",   createExpenseType);
router.put("/:id", updateExpenseType);
router.delete("/:id", deleteExpenseType);

module.exports = router;
