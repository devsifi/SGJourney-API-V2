const express = require('express')
const request = require('request-promise-native')
const router = express.Router()

const headers = {
        'AccountKey': process.env.DATAMALL_API_KEY + '=='
}

router.get('/', (req, resp) => {
    resp.send('Welcome to SGJourney /bus API')
})

router.get('/arrival', async function(req, resp) {
    const busStopCode = req.param.id
    const options = {
        url: 'http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=',
        headers: headers
    }

    let results = await request('http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=' + busStopCode).catch(console.error);

    console.log(options)
    console.log(process.env.DATAMALL_API_KEY)
    console.log(process.env)

    if(results) {
        resp.send(results.Services)
    } else {
        resp.send([])
    }
})

module.exports = router