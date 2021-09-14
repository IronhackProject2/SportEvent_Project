const router = require("express").Router();
const { loginCheck } = require('./middlewares');

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});


router.get('/profile', loginCheck(), (req, res, next) => {
  const loggedInUser = req.user;
  res.render('user/profile', { user: loggedInUser });
})

module.exports = router;
