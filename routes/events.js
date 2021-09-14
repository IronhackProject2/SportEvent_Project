const router = require("express").Router();
const { startSession } = require("../models/Event");
const Event = require('../models/Event');
const User = require('../models/User.model');
const { loginCheck } = require('./middlewares');
const axios = require('axios');

// function to get url from address
const getMapUrl = addressFromDB =>{
  const accessToken = '&access_token=pk.eyJ1IjoiaGFubmVzY2hvIiwiYSI6ImNrdGU1NWt6bzJtYzUyeGxhMmU5MGx3NGEifQ.pR78txw-BbZwg4y32xBJRg'
  let fullAddress = '';
  if (addressFromDB.houseNumber) {
    fullAddress += `${addressFromDB['houseNumber']}%20`
  }
  // add contry later (use country code)
  fullAddress +=`${addressFromDB['street'].replace(/\s/g, '%20')}%20${addressFromDB['city'].replace(/\s/g, '%20')}.json?}`
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${fullAddress}${accessToken}`
  return url
}

//my new comments

router.get('/events', (req, res, next) => {
  // get all events from the database
  Event.find().sort({'timeAndDate.starting': -1})
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
  console.log(req.body);
  const { title, description, location, startTime, startDate, endTime, endDate, housenumber, street, city, postcode, country} = req.body;
  
  
  // converting form date 
  const start = startDate.split('-').concat(startTime.split(':'))
  const end = endDate.split('-').concat(endTime.split(':'))
  // Date.UTC(year, month, day, hour, minute)
  const utcStarting = new Date(start[0], start[1], start[2], start[3], start[4]);
  const utcEnding = new Date(end[0], end[1], end[2], end[3], end[4]);

  console.log("------------- utcStarting:", utcStarting)
  console.log("------------- utcEnding:", utcEnding)

  const address = {
    houseNumber: housenumber,
    street:street,
    city:city,
    postcode:postcode,
    country:country
    }
  const url = getMapUrl(address)
    // use geocoding api from mapbox
    axios({
      method: 'get',
      url: url
      })
      .then(function (response) {
        // get [longitude, latitude] => for map we might need lat and log
        const latitude = response.data.features[0].geometry['coordinates'][1];
        const longitude = response.data.features[0].geometry['coordinates'][0];
        
        Event.create({
          title: title,
          description: description,
          location: location,
          timeAndDate: {
            starting: utcStarting,
            ending: utcEnding
          },
          coordinates: {
            latitude:latitude,
            longitude:longitude
          },
          address: {
            houseNumber: housenumber,
            street:street,
            city: city,
            postcode: postcode,
            country:country
          },
          creator: creator
        })
        .then(createdEvent => {
            console.log(createdEvent);
            res.redirect(`/events/${createdEvent._id}`);
        })
        .catch(err => next(err));
      });
        //res.redirect(`/events`);
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

       res.render('event/eventEdit', { event: eventFromDB, startTime: startTime, startDate: startDate, endTime: endTime,
        houseNumber: houseNumber, street:street, city: city, postcode: postcode, country:country });

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

	const { title, description, location, startTime, startDate, endTime, endDate, houseNumber, street, city, postcode, country } = req.body;
  
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
        },
        address: {
          houseNumber: houseNumber,
          street:street,
          city: city,
          postcode: postcode,
          country:country
        },
        creator: creator
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
      res.render('event/eventDetails', { event: eventFromDB, coordinates: eventFromDB.coordinates});
  })
  .catch(err => {
    next(err);
  })
});

module.exports = router;
