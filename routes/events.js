const router = require("express").Router();
const { startSession } = require("../models/Event");
const Event = require('../models/Event');
const User = require('../models/User.model');
const { loginCheck } = require('./middlewares');

//my new comments

router.get('/events', (req, res, next) => {
  // get all events from the database
  Event.find()
  .then(eventsFromDB => {
    console.log('-------- all events: ', eventsFromDB);
    res.render('event/events', { eventList: eventsFromDB });
  })
  .catch(err => {
    next(err);
  })
});

router.get('/events/add', (req, res, next) => {
  res.render('event/eventForm');
});

router.post('/events/add', loginCheck(), (req, res, next) => {
  const creator = req.user._id;
  const { title, description, location, startTime, startDate, endTime, endDate } = req.body;
  
  // converting form date 
  const start = startDate.split('-').concat(startTime.split(':'))
  const end = endDate.split('-').concat(endTime.split(':'))
  // Date.UTC(year, month, day, hour, minute)
  const utcStarting = new Date(start[0], start[1], start[2], start[3], start[4]);
  const utcEnding = new Date(end[0], end[1], end[2], end[3], end[4]);

  Event.create({
    title: title,
    description: description,
    location: location,
    coordinates: {
      x: 15.23464113440142,
      y: 52.74214432831203,
    },
    timeAndDate: {
      starting: utcStarting,
      ending: utcEnding
    },
    creator: creator
  })
  .then(createdEvent => {
    console.log(createdEvent);
    res.redirect(`/events/${createdEvent._id}`);
  })
  .catch(err => next(err));
});

router.get('/events/edit/:id', loginCheck(), (req, res, next) => {
  const loggedInUser = req.user
  const eventId = req.params.id
  
  Event.findById(eventId)
  .then(eventFromDB => {
    // here the problem ////
    const startTime = eventFromDB.timeAndDate.starting.toISOString().split("T")[1].split(".")[0]; 
    const endTime = eventFromDB.timeAndDate.ending.toISOString().split("T")[1].split(".")[0];
    const startDate = eventFromDB.timeAndDate.starting.toISOString().split("T")[0]; 
    const endDate = eventFromDB.timeAndDate.ending.toISOString().split("T")[0];
    
    //// console.log(typeof loggedInUser._id);
    //// console.log(typeof eventFromDB.creator);
    //// console.log(loggedInUser._id.toString() === eventFromDB.creator.toString());
    if (loggedInUser._id.toString() === eventFromDB.creator.toString() || loggedInUser.role === 'admin') {
       res.render('event/eventEdit', { event: eventFromDB, startTime: startTime, startDate: startDate, endTime: endTime, endDate: endDate });
    } else {
      res.redirect(`/events/${eventId}`)
    }

  })
  .catch(err => {
    next(err);
  })
});

router.post('/events/edit/:id', loginCheck(), (req, res, next) => {
  const loggedInUser = req.user
  const eventId = req.params.id;

	const { title, description, location, startTime, startDate, endTime, endDate } = req.body;
  
  // converting form date 
  const start = startDate.split('-').concat(startTime.split(':'))
  const end = endDate.split('-').concat(endTime.split(':'))
  
  // Date.UTC(year, month, day, hour, minute)
  const utcStarting = new Date(start[0], start[1], start[2], start[3], start[4]);
  const utcEnding = new Date(end[0], end[1], end[2], end[3], end[4]);
	
	// if findByIdAndUpdate() should return the updated event -> add {new: true}
  Event.findById(eventId)
  .then(eventFromDB => {
    if (loggedInUser._id.toString() === eventFromDB.creator.toString() || loggedInUser.role === 'admin') {
      Event.findByIdAndUpdate(eventId, {
        title: title,
        description: description,
        location: location,
        timeAndDate: {
          starting: utcStarting,
          ending: utcEnding
        }
      }, { new: true })
      .then(updatedEvent => {
        console.log(updatedEvent);
        res.redirect(`/events/${updatedEvent._id}`);
      })
      .catch(err => {
        next(err);
      })
    }
  })
  .catch(err => {
    next(err);
  })
});

router.get('/events/delete/:id', loginCheck(), (req, res, next) => {
	
	const eventId = req.params.id;
  const query = { _id: eventId }

  if (req.user.role !== 'admin') {
      query.creator = req.user._id.toString();
  } 
	Event.findByIdAndDelete(query)
	.then(() => {
		// redirect to events list
		res.redirect('/events')
	})
	.catch(err => {
		next(err);
	})
});

router.get('/events/:id', (req, res, next) => { 
  const eventId = req.params.id;
  Event.findById(eventId).populate('creator')
  .then(eventFromDB => {
    console.log(eventFromDB);
    res.render('event/eventDetails', { event: eventFromDB });
  })
  .catch(err => {
    next(err);
  })
});

module.exports = router;
