require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
require("./db/conn")
const auth = require("./middleware/auth")
const Customer = require("./models/custom")
const hbs = require('hbs')
const port = process.env.PORT
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')

const staticPath = path.join(__dirname, "../public")
const templatesPath = path.join(__dirname, "../templates/views")
const partialsPath = path.join(__dirname, "../templates/partials")

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

app.use(express.static(staticPath))
app.set("view engine", "hbs")
app.set("views", templatesPath)
hbs.registerPartials(partialsPath)

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/secret", auth, (req, res) => {
    res.render("secret")
})

app.get("/logout", auth, async (req, res) => {
    try {

        req.customer.tokens = req.customer.tokens.filter((currentElement) => {
            currentElement.token !== req.token
        })

        res.clearCookie("jwt")
        await req.customer.save()
        res.render("login")
        console.log("Logged out successfully")

    } catch (error) {
        res.status(500).send(error)
    }
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password
        const cpassword = req.body.confirmpassword

        if (password === cpassword) {
            const registerCustomer = new Customer({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword
            })

            const token = await registerCustomer.generateAuthToken()

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true
            })

            const registered = await registerCustomer.save()
            res.status(201).render("index")

        } else {
            res.send("Passwords do not match")
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const customerEmail = await Customer.findOne({ email: email })
        const isMatch = bcrypt.compare(password, customerEmail.password)

        const token = await customerEmail.generateAuthToken()

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 60000),
            httpOnly: true
        })

        if (isMatch) {
            res.status(201).render("index")
        } else {
            res.send("Invalid login details")
        }

    } catch (error) {
        res.status(400).send("Invalid login details")
    }

})

app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})
