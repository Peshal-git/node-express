const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE)
    .then(() => { console.log("Connection Successful") })
    .catch((e) => { console.log("No connection") })

