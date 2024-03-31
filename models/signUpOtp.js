const mongoose = require('mongoose');

// Define the schema for OTPs
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 // Set expiration time for OTP documents (e.g., 1 minutes)
    }
});

// Create a Mongoose model based on the schema
const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
