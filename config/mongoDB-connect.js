const mongoose = require("mongoose");
const db = "mongodb+srv://aquaponics:B4ViBVgXT7R09JG5@aquaponicsdb.ia1bi.mongodb.net/Aquaponics?retryWrites=true&w=majority"

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