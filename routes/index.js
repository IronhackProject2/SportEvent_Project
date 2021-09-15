const router = require("express").Router();
const { loginCheck } = require('./middlewares');
const Event = require('../models/Event');
const User = require('../models/User.model');

const userLog = false;

router.get("/", loginCheck(userLog), (req, res, next) => {
  if (userLog) {
    const loggedInUser = req.user;
    res.render("index", { user: loggedInUser });
  } else {
    res.render("index");
  }
});

router.get('/profile', loginCheck(), (req, res, next) => {
  const loggedInUser = req.user;
  Event.find({creator: loggedInUser._id}).sort({'timeAndDate.starting': -1})
  .then(eventsFromDB => {
    console.log('-------- all the users events: ', eventsFromDB);
    res.render('user/profile', { user: loggedInUser, eventList: eventsFromDB });
  })
  .catch(err => {
    next(err);
  })
})

module.exports = router;
