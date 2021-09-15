const router = require("express").Router();
const Event = require('../models/Event');
require("dotenv/config");

router.post('/search', (req, res, next) => {
    const searchTerm = req.body.search.toLowerCase();
    console.log(searchTerm);
    Event.find()
        .then(eventsFromDB => {
            let eventList = eventsFromDB.filter(el => {
                // field for search is in keys
                const keys = [ el['title'], el['description'], el['location'], el['sports'], el['address']['street'], el['address']['city'], el['address']['country'] ];
                for (let key of keys) {
                    if (key) {
                        if (key.toLowerCase().includes(searchTerm)) {
                            return true
                        }
                    }
                }
            })
              // center the map on the first event
              let centerLat = eventsFromDB[0].coordinates.latitude;
              let centerLon = eventsFromDB[0].coordinates.longitude;
              let positions = [];
              // add all the other events positions
              for (let event of eventsFromDB){
                  if (event.coordinates.latitude !== centerLat && event.coordinates.longitude !== centerLon){
                  positions.push( [event.coordinates.longitude, event.coordinates.latitude] );
                  }
              };
            res.render("search", { eventList: eventList, word: searchTerm, positions: JSON.stringify(positions), centerLat: centerLat, centerLon: centerLon });
        })
        .catch(err => next(err));
});

router.get("/search", (req, res, next) => {
    res.render("search");
  });

  module.exports = router;