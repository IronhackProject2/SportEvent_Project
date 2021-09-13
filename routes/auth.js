const router = require("express").Router();
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const passport = require('passport')

router.get("/signup", (req, res, next) => {
  res.render("user/signup");
});

router.get("/login", (req, res, next) => {
    res.render("user/login");
  });

router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login'
  }));

router.post('/signup', (req, res, next) => {
	console.log(req.body);
	const { username, password } = req.body;
	if (password.length < 4) {
		res.render('signup', { message: 'Your password needs to be 4 chars min' });
		return;
	}
	if (username.length === 0) {
		res.render('signup', { message: 'Username cannot be empty' });
		return;
	}
	User.findOne({ username: username })
		.then(userFromDB => {
			if (userFromDB !== null) {
				res.render('signup', { message: 'Username is already taken' });
			} else {
				const salt = bcrypt.genSaltSync();
				const hash = bcrypt.hashSync(password, salt);
				User.create({ username: username, password: hash })
					.then(createdUser => {
						res.redirect('/login');
					})
					.catch(err => {
						next(err);
					})
			}
		})
});

router.get('/logout', (req, res, next) => {
	req.session.destroy(err => {
		if (err) {
			next(err);
		} else {
			res.redirect('/');
		}
	})
});

module.exports = router;
