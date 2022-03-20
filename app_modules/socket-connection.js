const { PubSub } = require('@google-cloud/pubsub');   //google cloud pub/sub
const mongoose = require('mongoose');

//Include the Mongoose Models
const SensorValues = require('../models/Sensor_Values');
const PredictionValues = require('../models/Predictions_Values');

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

        const pubSubClient = new PubSub();
        const subscriptionName = 'projects/awesome-sylph-271611/subscriptions/my-subscription1';

        function listenForMessages(){
            // References to existing subscription
            const subscription = pubSubClient.subscription(subscriptionName);

            //Create a message event handler
            const messageHandler = message => {
                // Message handler for temperature, humidity and DO
                if (message == null || message.length === 0) return;
                console.log(`Received Sensor Values : ${message.data}`);
        
                const newSensorValuesToStore = new SensorValues({
                deviceId: message.data.deviceId,
                temperature: message.data.temperature,
                pHLevel: message.data.pHLevel,
                DOLevel: message.data.DOLevel,
                date: message.data.date
                });
        
                //ADD THE NEW VALUES TO THE DB
                newSensorValuesToStore.save()
                .then(result => {console.log(`Values Stored: ${result}`)});
        
                //SENSOR VALUES
                //TEMPERATURE
                io.emit('temperature', (message.data.deviceId + ";" + message.data.temperature + ";" + message.data.date).toString());
                //PH LEVEL
                io.emit('pHLevel', (message.data.deviceId + ";" + message.data.pHLevel + ";" + message.data.date).toString());
                //DO LEVEL
                io.emit('DOLevel', (message.data.deviceId + ";" + message.data.DOLevel + ";" + message.data.date).toString());
                
                // Message handler Prediction values

                const newPredictionValuestoStore = new PredictionValues({
                deviceId: message.deviceId,
                date: message.date,
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
                io.emit('latestpredictions', prediction);

                //"Ack" (acknowledge receipt of) the message
                message.ack();
            };

            // Listen for new messages until timeout is hit
            subscription.on('message', messageHandler);
        }

        listenForMessages();
    }
}