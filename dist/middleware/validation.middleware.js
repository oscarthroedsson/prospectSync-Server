"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanJobPostingValidation = void 0;
exports.validateRequest = validateRequest;
const express_validator_1 = require("express-validator");
function validateRequest(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
}
// Validation rules for scan routes
exports.scanJobPostingValidation = [
    (0, express_validator_1.query)("url").isURL().withMessage("url must be a valid URL"),
    validateRequest,
];
// Validation rules for other routes can be added here
//# sourceMappingURL=validation.middleware.js.map