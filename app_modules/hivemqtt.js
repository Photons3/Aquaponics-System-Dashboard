// HIVE MQTT CONNECTION
const mqtt = require('mqtt');

const options = {
    host: '5ba3332011924d82959504452a6e3d3f.s1.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'aquaponics3',
    password: '5Acan.vqiLVcRq5'
}

const client = mqtt.connect(options);

module.exports = client;