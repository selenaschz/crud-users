const User = require("../models/user.model")
const createError = require("http-errors")
const bcrypt = require("bcryptjs")
const dayjs = require("../config/dayjs.config")

module.exports.update = (req, res, next) => {
    const { id } = req.params;
    const { password } = req.body;

    User.findByIdAndUpdate(id, password, {runValidators: true, new: true})
        .then((user) => {
            if(!user) next(createError(404, "User not found"))
            else {
                // Encrypt password
                bcrypt.hash(password, 10)
                    .then((hash) => {
                        user.password = hash;
                        return user.save() // Execute pre save middleware (user.model.js)
                    })
                    .then((user) => {
                        res.status(201).json(user);
                    })
            }
        })
        .catch((error) => next(error))
}

module.exports.create =  (req, res, next) => {
    const { email } = req.body;
    User.findOne({email})
        .then((user) => {
            if(user) {
                next(createError(400, { message: "User email already taken", errors: { email: "Already exists"}}))
            } else {
                return User.create(req.body)
                    .then((user) => res.status(201).json(user))
            }
        })
        .catch((error) => next(error))
}


module.exports.list = (req, res, next) => {
    const { olderThan } = req.query;

    User.find()
        .then((users) => {
            if(olderThan) {
                // Date Limit -> subtract the minimum age to the current date, to obtain the date limit
                const dateLimit = dayjs().subtract(olderThan, "year").toDate()

                // Filter users -> Only older than olderThan query (dateLimit)
                olderUsers = users.filter((user) => dateLimit >= user.birthDate)
                res.status(200).json(olderUsers)
            } else {
                res.status(200).json(users)
            }
        })
        .catch((error) => next(error))
}

module.exports.detail = (req, res, next) => {
    const { id } = req.params;
    User.findById(id)
        .then((user) => {
            if(!user) next(createError(404, "User not found"))
            else res.status(200).json(user)
        })
        .catch((error) => next(error))
}

module.exports.delete = (req, res, next) => {
    const { id } = req.params;
    User.findByIdAndDelete(id)
        .then((user) => {
            if (!user) next(createError(404, "User not found"))
            else res.status(204).send()
        })
        .catch((error) => next(error))
}