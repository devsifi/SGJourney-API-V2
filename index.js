const express = require('express')
const morgan = require('morgan')
const parser = require('body-parser')

const PORT = process.env.PORT || 5000
const app = express()

app.use(morgan('dev'))
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());

app.use('/bus', require('./routes/bus'))

app.get('/', (req, res) => {
    res.send('Welcome to SGJourney API')
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send({
        success: false,
        messages: ["An error has occured while processing your request"]
    })
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))