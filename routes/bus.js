const express = require('express')
const router = express.Router()

router.get('/', (req, resp) => {
    resp.send('Welcome to SGJourney /bus API')
})

module.exports = router