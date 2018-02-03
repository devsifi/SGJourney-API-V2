const express = require('express')
const request = require('request-promise-native')
const router = express.Router()

const headers = {
        'AccountKey': process.env.DATAMALL_API_KEY + '=='
}

async function getBusStops() {
    let results = []
    let skip = 0

    let options = {
        url: 'http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=' + (skip * 500),
        headers: headers
    }

    let resp = JSON.parse(await request(options).catch(console.error))
    while(resp.value.length != 0) {
        results = results.concat(resp.value)
        console.log(options)
        
        if(resp.value.length != 500) {
            break;
        } else {
            skip++
            options.url = 'http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=' + (skip * 500)
            resp = JSON.parse(await request(options).catch(console.error))
        }
    }

    return results;
}

async function getBusRoutes() {
    let results = []
    let skip = 0

    let options = {
        url: 'http://datamall2.mytransport.sg/ltaodataservice/BusRoutes?$skip=' + (skip * 500),
        headers: headers
    }

    let resp = JSON.parse(await request(options).catch(console.error))
    while(resp.value.length != 0) {
        results = results.concat(resp.value)
        console.log(options)
        
        if(resp.value.length != 500) {
            break;
        } else {
            skip++
            options.url = 'http://datamall2.mytransport.sg/ltaodataservice/BusRoutes?$skip=' + (skip * 500)
            resp = JSON.parse(await request(options).catch(console.error))
        }
    }

    return results;
}

router.get('/', (req, resp) => {
    resp.send('Welcome to SGJourney /bus API')
})

router.get('/arrival', async function(req, resp) {
    const busStopCode = req.query.id

    if(busStopCode) {
        const options = {
            url: 'http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=' + busStopCode,
            headers: headers
        }

        let results = await request(options).catch(console.error)
        resp.send(JSON.parse(results).Services)
    } else {
        resp.send([])
    }
})

router.get('/stops', async function(req, resp) {
    let search = req.query.search
    let busStops = await getBusStops()
    // let busRoutes = await getBusRoutes()

    let results = busStops

    if(search) {
        search = search.replace('block', 'blk')

        console.log(search)
        results = results.filter(o => {
            var tmp = search.split(' ');
            var filterResults = true;
            tmp.forEach(word => {
                filterResults &= o.RoadName.toLowerCase().includes(word) || o.Description.toLowerCase().includes(word) || o.BusStopCode == word  
                if(!filterResults) return false
            });

            return filterResults
        })
    }

    resp.status(200).send(results)
})

module.exports = router