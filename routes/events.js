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

  const { title, description, location, startTime, startDate, endTime, endDate } = req.body;
  const start = startDate.split('-').concat(startTime.split(':'))
  const end = endDate.split('-').concat(endTime.split(':'))
// takes an array with time and date and returns it in utc date format
// function utcfy (arr) {
//   const time = arr[0].split(':')
//   const date = arr[1].split('-')
//   return date.concat(time)
// }


  console.log(start)
  console.log(end)

  // Date.UTC(year, month, day, hour, minute)
  const utcStarting = new Date(Date.UTC(start[0], start[1], start[2], start[3], start[4]));
  const utcEnding = new Date(Date.UTC(end[0], end[1], end[2], end[3], end[4]));

  Event.create({
    title: title,
    description: description,
    location: location,
    timeAndDate: {
      starting: utcStarting,
      ending: utcEnding
    }
    // creator: this will have to come from the cookie?
  })
  .then(createdEvent => {
    console.log(createdEvent);
    // res.redirect(`/events/${createdEvent._id}`);
    res.redirect(`/events`);
  })
  .catch(err => next(err));
});

// takes an array with time and date and returns it in utc date format
function utcfy (arr) {
  const time = arr[0].split(':')
  const date = arr[1].split('-')
  return date.concat(time)
}

module.exports = router;
