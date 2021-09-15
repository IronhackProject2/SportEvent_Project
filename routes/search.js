const router = require("express").Router();
const Event = require('../models/Event');
require("dotenv/config");

router.post('/search', (req, res, next) => {
    const searchTerm = req.body.search;
    const regex = { '$regex': searchTerm, '$options': 'i' }
    Event.find({ $or: [{ title: regex } , { description: regex}, { city: regex } ]})
        .then(eventsFromDB => {
            console.log(eventsFromDB);
            res.render("search", { eventList: eventsFromDB, word: searchTerm });
        })
        .catch(err => next(err));
 
});


router.get("/search", (req, res, next) => {
    res.render("search");
  });

  module.exports = router;