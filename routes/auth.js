const router = require("express").Router();

/* GET home page */
router.get("/signup", (req, res, next) => {
  res.render("user/signup");
});

router.get("/login", (req, res, next) => {
    res.render("user/login");
  });

module.exports = router;
