const router = require("express").Router();
const Event = require('../models/Event');
require("dotenv/config");

router.post('/search', (req, res, next) => {
    const loggedInUser = req.user;
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
            if (eventList.length !== 0) {
                  // center the map on the first event
                  let centerLat = eventList[0].coordinates.latitude;
                  let centerLon = eventList[0].coordinates.longitude;
                  let positions = [];
                  // add all the other events positions
                  for (let i=0; i < eventList.length; i++){
                        positions.push( [eventList[i].coordinates.longitude, eventList[i].coordinates.latitude] );
                  }
                  //formatted dates for display
                  for (ev of eventsFromDB){
                    const starting = ev.timeAndDate.starting.toLocaleString();
                    const ending = ev.timeAndDate.ending.toLocaleString();
                    ev.starting = starting;
                    ev.ending = ending;
                    console.log(ev)
                  }
                res.render("search", { eventList: eventList, word: searchTerm, positions: JSON.stringify(positions), centerLat: centerLat, centerLon: centerLon, user: loggedInUser });
            } else {
                const message = `No result for ${searchTerm}`
                res.render("search", { eventList: eventList, word: searchTerm, user: loggedInUser, message: message });
            }
            
        })
        .catch(err => next(err));
});

router.get("/search", (req, res, next) => {
    const loggedInUser = req.user;
    res.render("search", { user: loggedInUser });
  });

  module.exports = router;
