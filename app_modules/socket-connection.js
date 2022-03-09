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
        
            function listenForMessages(){
            //Create a message event handler
            const messageHandler = message => {
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
                //"Ack" (acknowledge receipt of) the message
                //message.ack();
            };
        
            //SEND THE PREDICTION TO THE CLIENT
            const predictionHandler = (prediction)=>{
                if (prediction == null || prediction.length === 0) return;
                console.log(`Received Prediction Values: ${prediction}`);
                
                const newPredictionValuestoStore = new PredictionValues({
                deviceId: prediction.deviceId,
                date: prediction.date,
                temperature:[
                    prediction.temperature[0],
                    prediction.temperature[1],
                    prediction.temperature[2],
                    prediction.temperature[3],
                    prediction.temperature[4],
                    prediction.temperature[5],
                    prediction.temperature[6],
                    prediction.temperature[7],
                    prediction.temperature[8],
                    prediction.temperature[9]
                    ],
                pHLevel: [
                    prediction.pHLevel[0],
                    prediction.pHLevel[1],
                    prediction.pHLevel[2],
                    prediction.pHLevel[3],
                    prediction.pHLevel[4],
                    prediction.pHLevel[5],
                    prediction.pHLevel[6],
                    prediction.pHLevel[7],
                    prediction.pHLevel[8],
                    prediction.pHLevel[9]
                ],
                DOLevel: [
                    prediction.DOLevel[0],
                    prediction.DOLevel[1],
                    prediction.DOLevel[2],
                    prediction.DOLevel[3],
                    prediction.DOLevel[4],
                    prediction.DOLevel[5],
                    prediction.DOLevel[6],
                    prediction.DOLevel[7],
                    prediction.DOLevel[8],
                    prediction.DOLevel[9]
                ]
            });
        
                //ADD THE NEW VALUES TO THE DB
                newPredictionValuestoStore.save()
                .then(result => {console.log(`Prediction Stored: ${result}`)});
        
                //SEND THE PREDICTIONS TO CLIENT
                io.emit('latestpredictions', prediction);
        
            };
        
            // Listen for new messages until timeout is hit
            socket.on('message', messageHandler);
            socket.on('incomingpredictions', predictionHandler);
            }
            listenForMessages();
        });
    }
}