const express = require('express');
const path = require('path');                       //path navigation
const bodyParser = require('body-parser');          //to access at req.value
const methodOverride = require('method-override');  //needs for edit and delete
const bcrypt = require('bcrypt');                   //for cryptography

const User = require("../models/Users");

let router = express.Router();

//BodyParser middleware
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());
router.use((express.static(path.join(__dirname, '.'))));

//method override middleware
router.use(methodOverride('_method'));

//Login Page
router.route('/')
    .get((req, res)=>{
        res.render('user_login/login_page', {document_title: 'Login Page'});
    })
    .post(async (req,res)=>{
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            req.session.error = "Invalid Credentials";
            return res.redirect("/login");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          req.session.error = "Invalid Credentials";
          return res.redirect("/login");
        }
      
        req.session.isAuth = true;
        req.session.username = user.username;
        res.redirect("/");

    });

module.exports = router;