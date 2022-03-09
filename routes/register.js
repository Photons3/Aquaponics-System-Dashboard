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

//Register Page
router.route('/')
    .get((req, res)=>{
        res.render('user_login/registration_page', {document_title: 'Register Page'});
    })
    .post(async (req, res)=>{
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
        });

        await user.save();
        res.redirect("/login");
    });

module.exports = router;