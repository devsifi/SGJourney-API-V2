const express = require('express')
const PORT = process.env.PORT || 5000

const app = express()

app.get('/', (req, res) => res.send('Welcome to SGJourney API'))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))