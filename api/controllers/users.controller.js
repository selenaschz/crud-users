const User = require("../models/user.model")
const createError = require("http-errors")
const dayjs = require("../config/dayjs.config")

module.exports.update = (req, res, next) => {
    const { id } = req.params;

    User.findById(id)
        .then((user) => {
            if (user) {
                Object.assign(user, req.body);

                user.save()
                    .then((user) => {
                        res.json(user);
                    })
                    .catch(next);
            } else {
                next(createError(404, "User not found"))
            }
        })
        .catch(next);
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
    const filters = {};
    const { olderThan } = req.query;
    
    if(olderThan) {
        const date = new Date()
        // Conver olderThan to number and set it as the year
        date.setFullYear(+olderThan);
        filters.birthDate = {
            // Less than older than
            $lt: olderThan
        }
    }
    User.find(filters)
        .then((users) => {
                res.status(200).json(users);
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