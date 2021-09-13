const router = require("express").Router();
const { startSession } = require("../models/Event");
const Event = require('../models/Event');
const User = require('../models/User.model');

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

router.post('/events/add', (req, res, next) => {
  console.log(req.body);
  const { title, description, location, startTime, startDate, endTime, endDate } = req.body;
  
  // converting form date 
  const start = startDate.split('-').concat(startTime.split(':'))
  const end = endDate.split('-').concat(endTime.split(':'))
  
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
    res.redirect(`/events/${createdEvent._id}`);
    //res.redirect(`/events`);
  })
  .catch(err => next(err));
});

router.get('/events/edit/:id', (req, res, next) => {
  const eventId = req.params.id
  
  Event.findById(eventId)
  .then(eventFromDB => {
    console.log(eventFromDB);
    // here the problem ////
    const startTime = eventFromDB.timeAndDate.starting.toISOString().split("T")[1].split(".")[0]; 
    const endTime = eventFromDB.timeAndDate.ending.toISOString().split("T")[1].split(".")[0];
    console.log("start time: ----------- ", startTime)
    console.log("end time: ----------- ", endTime)
    res.render('event/eventEdit', { event: eventFromDB, startTime: startTime, endTime: endTime });
  })
  .catch(err => {
    next(err);
  })
});

router.post('/events/edit/:id', (req, res, next) => {
	const eventId = req.params.id;

	const { title, description, location, startTime, startDate, endTime, endDate } = req.body;
  
  // converting form date 
  const start = startDate.split('-').concat(startTime.split(':'))
  const end = endDate.split('-').concat(endTime.split(':'))
  
  // Date.UTC(year, month, day, hour, minute)
  const utcStarting = new Date(Date.UTC(start[0], start[1], start[2], start[3], start[4]));
  const utcEnding = new Date(Date.UTC(end[0], end[1], end[2], end[3], end[4]));
	
	// if findByIdAndUpdate() should return the updated event -> add {new: true}
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
});

router.get('/events/delete/:id', (req, res, next) => {
	console.log('deleting this event');
	const eventId = req.params.id;
	Event.findByIdAndDelete(eventId)
	.then(() => {
		// redirect to events list
		res.redirect('/events')
	})
	.catch(err => {
		next(err);
	})
});

router.get('/events/:id', (req, res, next) => { 
  console.log(req.params);
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
