const mongoose = require("mongoose");
const db = "mongodb+srv://aquaponics:kkPtqtaAybCpbzk7@aquaponicssystem.nl36c.mongodb.net/?retryWrites=true&w=majority"

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.log("Something went wrong with Database connection");
    process.exit(1);
  }
};

module.exports = connectDB;