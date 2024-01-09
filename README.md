# Aquaponics System Dashboard

Dashboard for monitoring different sensor values from an aquaponics system using HiveMQ Broker, MongoDB and Node.JS

Created from modules Pub/Sub, Mongoose, Handlebars, Express, Bootstrap 5 and brypt.

**Features:**
Allows setting of parameters for Aquaponics System using Iot
![image](https://github.com/Photons3/Aquaponics-System-Dashboard/assets/18119113/f85a95c9-6928-46a7-a077-33119408e143)

Viewing of Sensor Values and Forecast Values in Realtime
![image](https://github.com/Photons3/Aquaponics-System-Dashboard/assets/18119113/f48f932e-5a19-4919-af07-c31861829c86)

Allows creating of accounts and authentication for security using bcrypt algorithm
ALlows for storing of sensor values in MongoDB Atlas database.

**Instruction for use:**
1.	Go to https://account.mongodb.com/account and log-in. (Change the code appropriately to connect to your database)
2.	If the database is full, navigate to the collections and delete all the records in the database.
3.	Go to https://dashboard.heroku.com/ and log-in.
4.	Navigate to deploy tab and install Heroku CLI.
5.	Copy the included Aquaponics-System-Dashboard folder from the CD to the development machine.
6.	Open the Aquaponics-System-Dashboard folder in VS Code.
7.	If MQTT broker have been changed, navigate to app_modules/hivemqtt.js file and change the options variable to properly match the credentials of the new MQTT cluster.
8.	If a new MongoDB Atlas database has been created navigate to app.js file and change line 19 with the new URI of the database.
9.	If a new MongoDB Atlas database has been created navigate to config/mongoDB-connect.js file and change line 2 with the new URI of the database.
10.	Save all the changes that has been done.
11.	Follow the steps in Deploy using Heroku Git at Heroku deploy tab in order to update the website.
12.	Navigate to resources and there should be an entry that has “web npm start” name, toggle the switch at the side of the entry to publish the webpage to the internet.
