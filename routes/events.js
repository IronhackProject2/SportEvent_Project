const router = require("express").Router();
const { startSession } = require("../models/Event");
const Event = require('../models/Event');
const User = require('../models/User.model');


router.get('/events', (req, res, next) => {
  // get all events from the database
  Event.find()
  .then(eventsFromDB => {
    console.log('-------- all events: ', eventsFromDB);
    res.render('events', { eventList: eventsFromDB });
  })
  .catch(err => {
    next(err);
  })
});


router.get('/events/add', (req, res, next) => {
  res.render('eventForm');
});

router.post('/events/add', (req, res, next) => {
  console.log(req.body);
  const { title, description, location, startTime, endTime } = req.body;
  Event.create({
    title: title,
    description: description,
    location: location,
    startTime: startTime,
    endTime: endTime
    // creator: this will have to come from the cookie?
  })
  .then(createdEvent => {
    console.log(createdEvent);
    // res.redirect(`/events/${createdEvent._id}`);
    res.redirect(`/events`);
  })
  .catch(err => next(err));
});

module.exports = router;
