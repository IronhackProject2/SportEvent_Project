const router = require("express").Router();
const { startSession } = require("../models/Event");
const Event = require('../models/Event');

const { loginCheck } = require('./middlewares');
const axios = require('axios');
require("dotenv/config");

// function to get url from address
const getMapUrl = addressFromDB =>{
  const accessToken = process.env.ACCESS_TOKEN
  let fullAddress = '';
  if (addressFromDB.houseNumber) {
    fullAddress += `${addressFromDB['houseNumber']}%20`
  }
  // add contry later (use country code)
  fullAddress +=`${addressFromDB['street'].replace(/\s/g, '%20')}%20${addressFromDB['city'].replace(/\s/g, '%20')}.json?}`
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${fullAddress}${accessToken}`
  console.log(url);
  return url
}


router.get('/events', (req, res, next) => {
  // get all events from the database sorted by starting time
  Event.find().sort({'timeAndDate.starting': -1})
  .then(eventsFromDB => {
    const loggedInUser = req.user;
    if (eventsFromDB.length === 0) {
      res.render('event/events', { user: loggedInUser });
    } else {
      // center the map on the first event
      let centerLat = eventsFromDB[0].coordinates.latitude;
      let centerLon = eventsFromDB[0].coordinates.longitude;
      let positions = [];
      // add all the other events positions
      for (let i=0; i < eventsFromDB.length; i++){
        positions.push( [eventsFromDB[i].coordinates.longitude, eventsFromDB[i].coordinates.latitude] );
      }

    for (ev of eventsFromDB){
      const starting = ev.timeAndDate.starting.toLocaleString();
      const ending = ev.timeAndDate.ending.toLocaleString();
      ev.starting = starting;
      ev.ending = ending;
    }
    res.render('event/events', { eventList: eventsFromDB, positions: JSON.stringify(positions), centerLat: centerLat, centerLon: centerLon, user: loggedInUser});
  }
  })
  .catch(err => {
    next(err);
  })
});

router.get('/events/add', (req, res, next) => {
  const loggedInUser = req.user;
  res.render('event/eventForm', { message : req.query.message, user: loggedInUser });
  
});

router.post('/events/add', loginCheck(), (req, res, next) => {
  const creator = req.user._id;
  const { title, description, location, sports, startTime, startDate, endTime, endDate, housenumber, street, city, postcode, country} = req.body;
  
  // converting form date 
  const start = startDate.split('-').concat(startTime.split(':'))
  const end = endDate.split('-').concat(endTime.split(':'))
  // Date.UTC(year, month, day, hour, minute)
  const utcStarting = new Date(start[0], start[1], start[2], start[3], start[4]);
  const utcEnding = new Date(end[0], end[1], end[2], end[3], end[4]);
  
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
      res.redirect(`/events/${createdEvent._id}`);
    })
    .catch(err => next(err));
  })
  .catch(err => {
    const url = require('url'); 
    //add message
    res.redirect(url.format ({
      pathname: '/events/add',
      query: {
        "message" : "worng address"
      }
    }))
    next(err);
  });
});

router.get('/events/edit/:id', loginCheck(), (req, res, next) => {
  const loggedInUser = req.user
  const eventId = req.params.id
  
  Event.findById(eventId)
  .then(eventFromDB => {
    
    const startTime = eventFromDB.timeAndDate.starting.toISOString().split("T")[1].split(".")[0]; 
    const endTime = eventFromDB.timeAndDate.ending.toISOString().split("T")[1].split(".")[0];
    const startDate = eventFromDB.timeAndDate.starting.toISOString().split("T")[0]; 
    const endDate = eventFromDB.timeAndDate.ending.toISOString().split("T")[0];
    
    if (loggedInUser._id.toString() === eventFromDB.creator.toString() || loggedInUser.role === 'admin') {
      res.render('event/eventEdit', { event: eventFromDB, startTime: startTime, startDate: startDate, endDate: endDate, endTime: endTime, user: loggedInUser });
      
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
  .catch(err => {
    next(err);
  })
});

router.get('/events/delete/:id', loginCheck(), (req, res, next) => {
  const loggedInUser = req.user;
  const eventId = req.params.id;
  const query = { _id: eventId }
  
  if (req.user.role !== 'admin') {
    query.creator = req.user._id.toString();
  } 
  Event.findByIdAndDelete(query)
  .then(() => {
    res.redirect('/events')
  })
  .catch(err => {
    next(err);
  })
});

router.get('/events/:id', (req, res, next) => { 
  const loggedInUser = req.user;
  const eventId = req.params.id;
  
  let editLink = null;
  
  Event.findById(eventId).populate('creator')
  .then(eventFromDB => {
    if (loggedInUser) {
      const userId = req.user._id;
      if (eventFromDB.creator._id.toString() === userId.toString()){
        editLink = `<form class='newEvent eventForm' action="/events/edit/${eventId}" method="GET">
        <button type="submit">Edit this event</button>
       </form>`
      }
    }
    
    const starting = eventFromDB.timeAndDate.starting.toLocaleString();
    const ending = eventFromDB.timeAndDate.ending.toLocaleString();
    console.log(starting, ending)
    Event.find().sort({'timeAndDate.starting': -1})
    .then(eventsFromDB => {
      let centerLat = eventFromDB.coordinates.latitude;
      let centerLon = eventFromDB.coordinates.longitude;
      let positions = [];
      for (let i=0; i < eventsFromDB.length; i++){
        positions.push( [eventsFromDB[i].coordinates.longitude, eventsFromDB[i].coordinates.latitude] );
      }
      res.render('event/eventDetails', { event: eventFromDB, editLink: editLink, positions: JSON.stringify(positions), centerLat: centerLat, centerLon: centerLon, user:loggedInUser, starting: starting, ending: ending});
    })
    .catch(err => {
      next(err);
    })
  })
  .catch(err => {
    next(err);
  })
});

module.exports = router;
