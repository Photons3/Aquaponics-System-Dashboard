const express = require('express');                 //Express web framework
const path = require('path');                       //path navigation
const bodyParser = require('body-parser');          //to access at req.value
const methodOverride = require('method-override');  //needs for edit and delete

let router = express.Router();

//BodyParser middleware
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());
router.use((express.static(path.join(__dirname, '.'))));

//method override middleware
router.use(methodOverride('_method'));

// Control Page
router.route('/')
    .get((req, res)=>{
        res.render("user_login/login_page", {document_title: 'Login Page'});
    });

router.route('/user/:userid')
    .get((req, res)=>{
        if (req.params.userid == 'jester')
            res.render('controls', {user_id: req.params.userid,
                                    document_title: 'Controls'});
        else
            res.render('user_login/login_page', {document_title: 'Login Page'});
    });

module.exports = router;