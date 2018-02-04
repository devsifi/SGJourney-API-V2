const express = require('express')
const request = require('request-promise-native')
const geolib = require('geolib')
const cache = require('memory-cache')
const _ = require('underscore')
const router = express.Router()

const headers = {
        'AccountKey': process.env.DATAMALL_API_KEY + '=='
}

async function getBusStops() {
    let results = []

    if(!cache.get('bus_stops')) {
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

        cache.put('bus_stops', results, 60 * 60 * 24 * 7)
    } else {
        results = cache.get('bus_stops')
    }

    return results;
}

async function getBusRoutes() {
    let results = []

    if(!cache.get('bus_routes')) {
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
        cache.put('bus_routes', results, 60 * 60 * 24 * 7)
    } else {
        results = cache.get('bus_routes')
    }

    return results;
}

router.get('/', (req, resp) => {
    resp.send('Welcome to SGJourney /bus API')
})

router.get('/nearby', async function(req, resp) {
    const longitude = req.query.longitude
    const latitude = req.query.latitude
    const radius = req.query.radius || 500
    if(longitude && latitude) {
        const currentLocation = {
            longitude: longitude,
            latitude: latitude,
        }

        await getBusStops().then((busStops) => {
            let results = busStops.filter(o => {
                const stopLocation = {
                    longitude: o.Longitude,
                    latitude: o.Latitude
                }
    
                return geolib.getDistance(currentLocation, stopLocation) <= radius
            })
            
            results =_.sortBy(results, (o) => {
    
                const loc1 = {
                    longitude: o.Longitude,
                    latitude: o.Latitude
                }

                const dist = geolib.getDistance(currentLocation, loc1, 100, 2)
                return dist
            });

            _.each(results, (o) => {
                {
                    const loc1 = {
                        longitude: o.Longitude,
                        latitude: o.Latitude
                    }
                }
            })

            resp.send(results)
        });   
    } else {
        resp.send([])
    }
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

router.get('/routes', async function(req, resp) {
    let search = req.query.service
    let busRoutes = await getBusRoutes()

    let results = busRoutes

    if(search) {
        results = results.filter(o => {
            return o.ServiceNo == search
        })

        results = _.sortBy(results, (o) => {
            return o.ServiceNo
        })
    } else {
        results = []
    }

    console.log(results.length)
    resp.send(results)
})

module.exports = router