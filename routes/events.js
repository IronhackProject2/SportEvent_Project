const router = require("express").Router();
const Event = require('../models/Event');
const User = require('../models/User.model');

/* GET home page */
router.get('/events', (req, res, next) => {
	// get all the books from the db
	Event.find()
	.then(eventsFromDB => {
		console.log('-------- all events: ', eventsFromDB);
		
		res.render('events', { eventList: eventsFromDB });
	})
	.catch(err => {
		// instead of console logging the error we now pass it to the 
		// error handler via next()
		next(err);
	})
})

module.exports = router;
