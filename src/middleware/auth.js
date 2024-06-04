const jwt = require('jsonwebtoken')
const Customer = require("../models/custom")

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY)

        const customer = await Customer.findOne({ _id: verifyUser._id })

        req.token = token
        req.customer = customer

        next()

    } catch (error) {
        res.status(401).send(error)
    }
}

module.exports = auth