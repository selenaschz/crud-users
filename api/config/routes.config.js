const mongoose = require("mongoose")
const express = require("express")
const router = express.Router()
const createError = require("http-errors")
const users = require("../controllers/users.controller")

// Routes
router.patch("/users/:id", users.update);
router.post("/users", users.create);
router.get("/users", users.list);
router.get("/users/:id", users.detail)
router.delete("/users/:id", users.delete)

// Errors:
// 404:
router.use((req, res, next) => {
    next(createError(404, "Route not found"));
})

// Other errors
router.use((error, req, res, next) => {
    if (error instanceof mongoose.Error.CastError && error.message.includes("_id")) error = createError(404, "Resource not found")
    else if (error instanceof mongoose.Error.ValidationError) error = createError(400, error);
    else if (!error.status) error = createError(500, error.message)

    const data = {}
    data.message = error.message;
    if(error.errors) {
        data.errors = Object.keys(error.errors)
            .reduce((errors, errorKey) => {
                errors[errorKey] = error.errors[errorKey].message;
                errors[errorKey] = error.errors[errorKey]?.message || error.errors[errorKey];
                return errors;
            }, {})
    }
    res.status(error.status).json(data);
})

module.exports = router;