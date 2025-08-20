// models.js
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  cardUID: { type: String, required: true, unique: true },
  wallet: { type: Number, default: 0 },
  address:{type: String, required: true}
});

// Ticket Schema
const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardUID: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  fare: { type: Number, required: true },
  status: { type: String, enum: ['booked', 'used'], default: 'booked' },
  timestamp: { type: Date, default: Date.now }
});

// Scan Log Schema
const scanLogSchema = new mongoose.Schema({
  cardUID: { type: String, required: true },
  gateId: { type: String, default: 'gate-1' },
  scanTime: { type: Date, default: Date.now },
  result: { type: String, enum: ['access_granted', 'denied'], required: true }
});

const User = mongoose.model('User', userSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);
const ScanLog = mongoose.model('ScanLog', scanLogSchema);

module.exports = {
  User,
  Ticket,
  ScanLog
};
