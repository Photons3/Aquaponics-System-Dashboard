const bcrypt = require("bcrypt");
const fs = require('fs');

const User = require("../models/Users");
const hivemqClient = require("../app_modules/hivemqtt.js");

let isUserLoggedIn = false; 

//TIME FORMMATING FUNCTION
function getTimeofData(ValueOfDate, appendSeconds = true){
    timeOfData = new Date(ValueOfDate);
    hours = timeOfData.getHours().toString();
    minutes = timeOfData.getMinutes().toString().padStart(2, '0');
    seconds = timeOfData.getSeconds().toString().padStart(2, '0');
    if(appendSeconds == true) return hours + ":" + minutes + ":" + seconds;
    else return hours + ":" + minutes;
}

exports.landing_page = (req, res) => {
  isUserLoggedIn = req.session.isAuth;
  res.render("index", { logged_in: isUserLoggedIn,
                        document_title: "Aquaponics Dashboard"
                      });
};

exports.monitoring_get = (req, res) => {
  isUserLoggedIn = req.session.isAuth;

  fs.readFile('./config/feederStatus.json', (err,data)=> {
    if (err) throw err;
    const lastFeedTimeData = JSON.parse(data);
    const lastfeedtime = getTimeofData(lastFeedTimeData.FeederOn, false);

    fs.readFile('./config/controls.json', (err,data)=> {
      if (err) throw err;
      const message = JSON.parse(data);
      const nextFeedTime = getTimeofData(lastFeedTimeData.FeederOn + ((24 * 60 * 60 * 1000)/message.FishFreq), false);

      res.render('monitoring',{ logged_in: isUserLoggedIn,
        lastFeedTime: lastfeedtime,
        nextFeedTime: nextFeedTime,
        document_title: "Monitoring"
      });
    });
  });
}

exports.controls_get = (req, res) => {
  isUserLoggedIn = req.session.isAuth;

  fs.readFile('./config/controls.json', (err, data) =>{
    if (err) throw err;
    let controlConfig = JSON.parse(data);

    res.render('controls',{ 
      logged_in: isUserLoggedIn, 
      TempLow: controlConfig.TempLow,
      TempHigh: controlConfig.TempHigh,
      PhLow: controlConfig.PhLow,
      PhHigh: controlConfig.PhHigh,
      DOLow: controlConfig.DOLow,
      DOHigh: controlConfig.DOHigh,
      FishFreq: controlConfig.FishFreq,
      SubmersiblePumpDuration: controlConfig.PumpD / 1000,
      FishFeedDuration: controlConfig.FishD / 1000,
      document_title: "Controls"
    });
  });
}

exports.controls_post = (req, res) => {
  isUserLoggedIn = req.session.isAuth;
  const { TempLow, TempHigh, 
          DOLow, DOHigh, 
          PhLow, PhHigh,
          FishFreq,
          SubmersiblePumpDuration,
          FishFeedDuration } = req.body;
  
  // Sanitize the input of the user
  if ( ( (TempLow < TempHigh) && (DOLow < DOHigh) && (PhLow < PhHigh) ) &&
      ( (TempLow > 10) && (TempHigh < 40) ) && ( (DOLow > 0) && (DOHigh < 50) ) &&
      ( (PhLow > 2) && (PhHigh < 15) ) && ( (FishFreq > 0) && (FishFreq < 10) ) &&
      ( (SubmersiblePumpDuration >= 0) && (SubmersiblePumpDuration < (10 * 60) ) ) &&
      ( (FishFeedDuration >= 0) && (FishFeedDuration < (10*60) ) ) )
      {
        const SubmersiblePumpDurationMS = SubmersiblePumpDuration * 1000;
        const FishFeedDurationMS = FishFeedDuration * 1000;

        const configuration = {
          TempLow: TempLow,
          TempHigh: TempHigh,
          PhLow: PhLow,
          PhHigh: PhHigh,
          DOLow: DOLow,
          DOHigh: DOHigh,
          FishFreq: FishFreq,
          PumpD: SubmersiblePumpDurationMS.toString(),
          FishD: FishFeedDurationMS.toString()
        }

        //const message = TempLow.toString() + ' ' + TempHigh.toString();
        const message = JSON.stringify(configuration).replace(/[{}]/g, "");
        hivemqClient.publish('/aquaponics/lspu/configuration', message, {qos: 2}, ()=>{
          console.log(message);
        })

        // Save the configuration to a file
        const data = JSON.stringify(configuration, null, 2);
        fs.writeFile("./config/controls.json", data, err=>{
          if (err) throw err;
          res.render('controls', { 
            logged_in: isUserLoggedIn,
            TempLow: TempLow,
            TempHigh: TempHigh,
            PhLow: PhLow,
            PhHigh: PhHigh,
            DOLow: DOLow,
            DOHigh: DOHigh,
            FishFreq: FishFreq,
            SubmersiblePumpDuration: SubmersiblePumpDurationMS / 1000,
            FishFeedDuration: FishFeedDurationMS / 1000,
            document_title: "Controls"
            });
        });
      }
    
    // Return the previous configuration if sanitization failed
    else {
    fs.readFile('./config/controls.json', (err, data) =>{
      if (err) throw err;
      let controlConfig = JSON.parse(data);
  
      res.render('controls',{ logged_in: isUserLoggedIn, 
        TempLow: controlConfig.TempLow,
        TempHigh: controlConfig.TempHigh,
        PhLow: controlConfig.PhLow,
        PhHigh: controlConfig.PhHigh,
        DOLow: controlConfig.DOLow,
        DOHigh: controlConfig.DOHigh,
        FishFreq: controlConfig.FishFreq,
        SubmersiblePumpDuration: controlConfig.PumpD / 1000,
        FishFeedDuration: controlConfig.FishFeedD / 1000,
        document_title: "Controls"
        });
    });
  }
}

exports.login_get = (req, res) => {
  const error = req.session.error;
  delete req.session.error;

  isUserLoggedIn = req.session.isAuth;
  res.render("user_login/login_page", 
  { err: error, 
    logged_in: false,
    document_title: "Login"
  });
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
  res.render("user_login/registration_page", { logged_in: isUserLoggedIn,
                                               document_title: "Register"
                                              });
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
    logged_in: isUserLoggedIn,
    document_title: "Aquaponics Dashboard"
  });
};

exports.logout_post = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
};