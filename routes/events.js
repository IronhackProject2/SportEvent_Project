const router = require("express").Router();
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

module.exports = router;
