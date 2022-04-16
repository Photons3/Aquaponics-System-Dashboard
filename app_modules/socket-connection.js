const mongoose = require('mongoose');
const mqtt = require('mqtt');
const hiveclient = require("./hivemqtt.js");

//Include the Mongoose Models
const SensorValues = require('../models/Sensor_Values');
const PredictionValues = require('../models/Predictions_Values');

function getMonthString(month)
{
    switch(month) {
        case 1:
            return "Jan";
        case 2:
            return "Feb";
        case 3:
            return "Mar";
        case 4:
            return "Apr";
        case 5:
            return "May";
        case 6:
            return "Jun";
        case 7:
            return "Jul";
        case 8:
            return "Aug";
        case 9:
            return "Sep";
        case 10:
            return "Oct";
        case 11:
            return "Nov";
        case 12:
            return "Dec";
        default:
            return "Jan";
    }
};

module.exports = {
    start: function(io){
        //NEW SOCKET CONNECTION
        io.on('connection', (socket)=>{

            //THIS WILL FIRE UP WHEN A CLIENT VISIT THE WEBPAGE
            socket.on('monitoringConnection', ()=>{
            //LAST 1 HOUR VALUES TO WEBPAGE
            var sensorValues = SensorValues.find({
                date: { $gt: parseInt(Date.now()/1000) - 3600}
            }).sort({date: -1}).then(values => {
                if (values == null || values.length === 0) return;
                socket.emit('lastsensorvalues', values);
            });
        
            //LAST PREDICTIONS TO WEBPAGE
            //THIS WILL QUERY THE LAST 10 MIN OF PREDICTION VALUE
            var predictionValues = PredictionValues.find({
                date: {$gte: parseInt(Date.now()/1000) - 900}})
            .sort({$natural: - 1}).limit(1)
            .then(values => {
                if (values == null || values.length === 0) return;
                socket.emit('lastpredictions', values);
            });
            });
        });

        function listenForMessages(){
            //Create a message event handler
            const messageHandler = (topic, messageReceived) => {

                if (messageReceived == null || messageReceived.length === 0) return;
                console.log(`Received Sensor Values : ${messageReceived}`);

                if (topic == "/aquaponics/lspu/sensors")
                {

                    const message = JSON.parse(messageReceived);
                    
                    // const dateReceivedStr = message.DATE[3].toString() 
                    //                     + "-" + getMonthString(message.DATE[4]) + "-" 
                    //                     + message.DATE[5].toString() 
                    //                     + " "  + message.DATE[1].toString()
                    //                     + ":"  + message.DATE[2].toString()
                    //                     + ":" + message.DATE[0].toString()
                    //                     + " GMT+08";

                    // const dateReceived = Date.parse(dateReceivedStr)/1000;
                    const dateReceived = Date.now()/1000;
                    // Message handler for temperature, PH and DO
                    const newSensorValuesToStore = new SensorValues({
                    deviceId: 'ESP32',
                    date: dateReceived,                
                    temperature: message.TEMP,
                    pHLevel: message.PH,
                    DOLevel: message.DO,
                    WaterHeight: message.WH,
                    });
            
                    //ADD THE NEW VALUES TO THE DB
                    newSensorValuesToStore.save()
                    .then(result => {console.log(`Values Stored: ${result}`)});
            
                    //SENSOR VALUES
                    //TEMPERATURE
                    io.emit('temperature', ('ESP32' + ";" + message.TEMP + ";" + dateReceived).toString());
                    //PH LEVEL
                    io.emit('pHLevel', ('ESP32' + ";" + message.PH + ";" + dateReceived).toString());
                    //DO LEVEL
                    io.emit('DOLevel', ('ESP32' + ";" + message.DO + ";" + dateReceived).toString());
                }

                if (topic == "/aquaponics/lspu/predictions")
                {
                    const message = JSON.parse(messageReceived);
                    // Message handler Prediction values
                    // const dateReceivedStr = message.DATE[3].toString() 
                    // + "-" + getMonthString(message.DATE[4]) + "-" 
                    // + message.DATE[5].toString() 
                    // + " "  + message.DATE[1].toString()
                    // + ":"  + message.DATE[2].toString()
                    // + ":" + message.DATE[0].toString()
                    // + " GMT+08";

                    // const dateReceived = Date.parse(dateReceivedStr)/1000;
                    const dateReceived = Date.now()/1000;

                    message.date = Date.now();
                    const newPredictionValuestoStore = new PredictionValues({
                        deviceId: 'ESP32',
                        date: dateReceived,
                        temperature:[
                            message.temperature[0],
                            message.temperature[1],
                            message.temperature[2],
                            message.temperature[3],
                            message.temperature[4],
                            message.temperature[5],
                            message.temperature[6],
                            message.temperature[7],
                            message.temperature[8],
                            message.temperature[9]
                            ],
                        pHLevel: [
                            message.pHLevel[0],
                            message.pHLevel[1],
                            message.pHLevel[2],
                            message.pHLevel[3],
                            message.pHLevel[4],
                            message.pHLevel[5],
                            message.pHLevel[6],
                            message.pHLevel[7],
                            message.pHLevel[8],
                            message.pHLevel[9]
                        ],
                        DOLevel: [
                            message.DOLevel[0],
                            message.DOLevel[1],
                            message.DOLevel[2],
                            message.DOLevel[3],
                            message.DOLevel[4],
                            message.DOLevel[5],
                            message.DOLevel[6],
                            message.DOLevel[7],
                            message.DOLevel[8],
                            message.DOLevel[9]
                        ]
                        });
                
                    //ADD THE NEW VALUES TO THE DB
                    newPredictionValuestoStore.save()
                    .then(result => {console.log(`Prediction Stored: ${result}`)});
            
                    //SEND THE PREDICTIONS TO CLIENT
                    io.emit('latestpredictions', message);
                } 
            };

            //setup the callbacks
            hiveclient.on('connect', () => {
                console.log('Connected to HIVEMQ');
            });

            hiveclient.on('error', (error) => {
                console.log(error);
            });

            hiveclient.on('message', messageHandler);

            // Listen for new messages until timeout is hit
            // subscribe to topics
            hiveclient.subscribe('/aquaponics/lspu/sensors');
            hiveclient.subscribe('/aquaponics/lspu/predictions');
        }

        listenForMessages();
    }
}