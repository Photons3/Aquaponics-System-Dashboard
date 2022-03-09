const bcrypt = require("bcrypt");

const User = require("../models/Users");

let isUserLoggedIn = false; 

exports.landing_page = (req, res) => {
  isUserLoggedIn = req.session.isAuth;
  res.render("index", { logged_in: isUserLoggedIn });
};

exports.monitoring_get = (req, res) => {
  isUserLoggedIn = req.session.isAuth;
  res.render('monitoring',{ logged_in: isUserLoggedIn });
}

exports.controls_get = (req, res) => {
  isUserLoggedIn = req.session.isAuth;
  res.render('controls', { logged_in: isUserLoggedIn });
}

exports.login_get = (req, res) => {
  const error = req.session.error;
  delete req.session.error;

  isUserLoggedIn = req.session.isAuth;
  res.render("user_login/login_page", 
  { err: error, 
    logged_in: false});
};

exports.login_post = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login");
  }

  if(!user.isVerified){
    req.session.error = "Not Verified";
    return res.redirect("/login");
  }
  
  req.session.isAuth = true;
  req.session.username = user.username;

  isUserLoggedIn = req.session.isAuth;
  res.redirect("/");
};

exports.register_get = (req, res) => {
  const error = req.session.error;
  delete req.session.error;

  isUserLoggedIn = req.session.isAuth;
  res.render("user_login/registration_page", { logged_in: isUserLoggedIn });
};

exports.register_post = async (req, res) => {
  const { username, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    req.session.error = "User already exists";
    return res.redirect("/register");
  }

  const hasdPsw = await bcrypt.hash(password, 12);

  user = new User({
    username,
    email,
    password: hasdPsw,
    isVerified: false
  });

  await user.save();
  res.redirect("/login");
};

exports.dashboard_get = (req, res) => {
  const username = req.session.username;

  isUserLoggedIn = req.session.isAuth;
  res.render("index", 
  { name: username,
    logged_in: isUserLoggedIn});
};

exports.logout_post = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
};