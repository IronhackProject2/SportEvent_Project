const router = require("express").Router();
const { startSession } = require("../models/Event");
const Event = require('../models/Event');
const User = require('../models/User.model');
const { loginCheck } = require('./middlewares');
const axios = require('axios');
require("dotenv/config");

// function to get url from address
const getMapUrl = addressFromDB =>{
  
  const accessToken = process.env.ACCESS_TOKEN
  console.log(accessToken);
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
  const { title, description, location, sports, startTime, startDate, endTime, endDate, housenumber, street, city, postcode, country} = req.body;
  
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
          creator: creator,
          sports: sports
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

       res.render('event/eventEdit', { event: eventFromDB, startTime: startTime, startDate: startDate, endDate: endDate, endTime: endTime });

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

	const { title, description, location, sports, startTime, startDate, endTime, endDate, housenumber, street, city, postcode, country } = req.body;
  const address = {
    houseNumber: housenumber,
    street:street,
    city:city,
    postcode:postcode,
    country:country
    }
  
  // converting form date 
  const start = startDate.split('-').concat(startTime.split(':'))
  const end = endDate.split('-').concat(endTime.split(':'))
  
  // Date.UTC(year, month, day, hour, minute)
  const utcStarting = new Date(start[0], start[1], start[2], start[3], start[4]);
  const utcEnding = new Date(end[0], end[1], end[2], end[3], end[4]);
	
	// if findByIdAndUpdate() should return the updated event -> add {new: true}
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
              sports:sports
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
  const userId = req.user._id;
  let editLink = null;
  
  
  Event.findById(eventId).populate('creator')
  .then(eventFromDB => {
    console.log(eventFromDB);

    if (eventFromDB.creator._id.toString() === userId.toString()){
      editLink = `<a href="/events/edit/{{_id}}">Edit this event </a>`
    }
    console.log('------',eventFromDB.creator._id, '------' , userId)
      res.render('event/eventDetails', { event: eventFromDB, editLink: editLink});
  })
  .catch(err => {
    next(err);
  })
});

module.exports = router;
