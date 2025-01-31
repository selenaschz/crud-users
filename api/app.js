const express = require("express")
require("dotenv").config()
const logger = require("morgan")
const routes = require("./config/routes.config")

// App
const app = express()

// DB init
require("./config/db.config")

// Middlewares
app.use(logger("dev"))
app.use(express.json())
app.use("/api/v1/", routes)

// App listen
const port = Number(process.env.PORT || 3000)
app.listen(port, () => console.info(`Application running at port ${port}`))