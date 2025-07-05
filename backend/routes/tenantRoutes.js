const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { validateTenant } = require("../middleware/tenantValidator");
const { validationResult } = require("express-validator");

router.post(
  "/register",
  verifyToken,
  authorizeRoles("manager"),
  validateTenant,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  tenantController.createTenant
);
router.get(
  "/",
  verifyToken,
  authorizeRoles("manager"),
  tenantController.getAllTenant
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("manager"),
  tenantController.updateTenant
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("manager"),
  tenantController.deleteTenant
);

module.exports = router;
