const mongoose = require("mongoose");
const dayjs = require("../config/dayjs.config")

// Encrypt password:
const bcrypt = require("bcryptjs")
const SALT_WORK_FACTOR = 10; /* 10 es el factor de trabajo, controla la cantidad de procesamiento 
                                que bcrypt necesita para generar un hash. Cuanto mayor sea el nº, 
                                + tiempo lleva y hace que los ataques sean mas difíciles. 10 es intermedio y equilibrado*/

// Patterns:
const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_PATTERN = /^.{8,}$/;

// User Schema:
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "User name is required"],
        maxLength: [30, "User name characters must be lower than 30"],
        trim: true
    },
    email: {
        type: String, 
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, "User email is required"],
        match: [EMAIL_PATTERN, "Invalid user email pattern"]
    },
    password: {
        type: String,
        required: [ true, "User password is required"],
        match: [PASSWORD_PATTERN, "Invalid user password pattern"]
    },
    bio: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
        default: function() {
            return `https://i.pravatar.cc/350?u=${this.email}`
        },
        validate: {
            validator: function(avatar) {
                try {
                    new URL(avatar);
                    return true;
                } catch(e) {
                    return false;
                }
            },
            message: function() {
                return "Invalid avatar URL"
            }
        }
    },
    birthDate: {
        type: Date,
        required: [true, "The birthdate is mandatory"],
        validate: {
            validator: function(birthDate) {
                // dayjs() devuelve la fecha actual y substraigo (resto) 18 años
                return dayjs(birthDate).isBefore(dayjs().subtract(18, "year"))
            },
            message: function() {
                return "Go back home, you are to young"
            }
        }
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.__v;
            delete ret._id;
            delete ret.password;
            ret.id = doc.id;
            return ret;
        }
    }
})

// Before saving the User to the db, encrypt the password:
userSchema.pre("save", function(next) {
    // Only generate a new hash if the password has changed.
    if (this.isModified("password")) {
        bcrypt.hash(this.password, SALT_WORK_FACTOR)
            .then((hash) => {
                this.password = hash;
                next()
            })
            .catch((error) => next(error))
    } else {
        next();
    }
})

const User = mongoose.model("User", userSchema)
module.exports = User;