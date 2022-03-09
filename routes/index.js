const express = require('express');
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

// Index Page
router.route('/')
    .get((req, res)=>{
        res.render('index', {document_title: 'Aquaponics System'});
});

router.route('/:userid')
    .get((req, res)=>{
        userid = req.params.userid
        
        if (req.params.userid == 'jester')
            res.render('index', {user_id: userid, 
                                document_title: 'Aquaponics System'});
        else
            res.render('index', {document_title: 'Aquaponics System'});
    });

module.exports = router;