// HIVE MQTT CONNECTION
const mqtt = require('mqtt');

const options = {
    host: '715aab764cd5446a8c9fde6c5e851acd.s1.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'aquaponics3',
    password: '5Acan.vqiLVcRq5'
}

const client = mqtt.connect(options);

module.exports = client;