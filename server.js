// // server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const { User, Ticket, ScanLog } = require('./models');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect('mongodb+srv://soumik:soumik1234@cluster0.wf3htff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log("✅ MongoDB connected"))
//   .catch(err => console.error("❌ MongoDB connection error:", err));

// // ----------------------- ROUTES ---------------------------

// // Register a new user
// app.post('/register', async (req, res) => {
//   try {
//     const { name, email, cardUID } = req.body;
//     const existing = await User.findOne({ cardUID });
//     if (existing) return res.status(400).json({ message: "Card already registered" });

//     const user = new User({ name, email, cardUID });
//     await user.save();
//     res.json({ message: "User registered", user });
//   } catch (err) {
//     res.status(500).json({ message: "Error registering user", error: err.message });
//   }
// });

// // Manually add wallet balance
// app.post('/wallet/add', async (req, res) => {
//   try {
//     const { cardUID, amount } = req.body;
//     const user = await User.findOne({ cardUID });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.walletBalance += amount;
//     await user.save();
//     res.json({ message: "Balance added", walletBalance: user.walletBalance });
//   } catch (err) {
//     res.status(500).json({ message: "Error updating balance", error: err.message });
//   }
// });

// // Book a ticket
// app.post('/ticket/book', async (req, res) => {
//   try {
//     const { cardUID, source, destination, fare } = req.body;
//     const user = await User.findOne({ cardUID });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.walletBalance < fare) {
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     user.walletBalance -= fare;
//     await user.save();

//     const ticket = new Ticket({
//       userId: user._id,
//       cardUID,
//       source,
//       destination,
//       fare,
//       status: "booked"
//     });
//     await ticket.save();

//     res.json({ message: "Ticket booked", ticket });
//   } catch (err) {
//     res.status(500).json({ message: "Error booking ticket", error: err.message });
//   }
// });

// // RFID gate scan (ESP32 calls this)
// app.post('/gate/scan', async (req, res) => {
//   try {
//     const { cardUID } = req.body;

//     const ticket = await Ticket.findOne({ cardUID, status: "booked" }).sort({ timestamp: -1 });
//     if (ticket) {
//       ticket.status = "used";
//       await ticket.save();

//       await ScanLog.create({
//         cardUID,
//         result: "access_granted"
//       });

//       return res.json({ access: true });
//     }

//     await ScanLog.create({
//       cardUID,
//       result: "denied"
//     });

//     res.json({ access: false });
//   } catch (err) {
//     res.status(500).json({ message: "Error scanning ticket", error: err.message });
//   }
// });

// // Get active ticket for user (optional)
// app.get('/ticket/user/:cardUID', async (req, res) => {
//   try {
//     const ticket = await Ticket.findOne({ cardUID: req.params.cardUID, status: "booked" }).sort({ timestamp: -1 });
//     if (!ticket) return res.status(404).json({ message: "No active ticket found" });

//     res.json(ticket);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching ticket", error: err.message });
//   }
// });
// // Get all users (for admin)
// app.get('/users', async (req, res) => {
//     const users = await User.find({});
//     res.json(users);
//   });
  
//   // Get all tickets (for admin)
//   app.get('/tickets', async (req, res) => {
//     const tickets = await Ticket.find({});
//     res.json(tickets);
//   });
// // -----------------------------------------------------------

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(bodyParser.json());

// // Connect to MongoDB
// mongoose.connect('mongodb+srv://soumik:soumik1234@cluster0.wf3htff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log("✅ MongoDB connected"))
// .catch(err => console.error("❌ MongoDB connection error:", err));

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   rfid: String,
//   wallet: { type: Number, default: 100 }, // default balance
// });

// const ticketSchema = new mongoose.Schema({
//   email: String,
//   source: String,
//   destination: String,
//   fare: Number,
//   status: { type: String, default: 'valid' }, // 'valid', 'used', 'expired'
//   createdAt: { type: Date, default: Date.now },
// });

// const User = mongoose.model('User', userSchema);
// const Ticket = mongoose.model('Ticket', ticketSchema);

// // ------------------------- API Routes -------------------------

// // Register User
// app.post('/register', async (req, res) => {
//   const { name, email, rfid } = req.body;
//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ error: 'User already exists' });

//     const user = new User({ name, email, rfid });
//     await user.save();
//     res.json({ message: 'User registered successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Book Ticket with auto fare deduction
// app.post('/book-ticket', async (req, res) => {
//   const { email, source, destination } = req.body;
//   const stopOrder = ['A', 'B', 'C', 'D', 'E'];
//   const farePerStop = 10;

//   const sourceIndex = stopOrder.indexOf(source);
//   const destinationIndex = stopOrder.indexOf(destination);

//   if (sourceIndex === -1 || destinationIndex === -1 || source === destination) {
//     return res.status(400).json({ error: 'Invalid source or destination' });
//   }

//   const fare = Math.abs(destinationIndex - sourceIndex) * farePerStop;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     if (user.wallet < fare) return res.status(400).json({ error: 'Insufficient wallet balance' });

//     user.wallet -= fare;
//     await user.save();

//     const ticket = new Ticket({ email, source, destination, fare });
//     await ticket.save();

//     res.json({ message: 'Ticket booked', walletBalance: user.wallet });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Gate scan (by RFID) — Use Ticket and deduct extra fare if needed
// app.post('/scan', async (req, res) => {
//   const { rfid, actualDestination } = req.body;
//   const stopOrder = ['A', 'B', 'C', 'D', 'E'];
//   const farePerStop = 10;

//   try {
//     const user = await User.findOne({ rfid });
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const ticket = await Ticket.findOne({ email: user.email, status: 'valid' }).sort({ createdAt: -1 });
//     if (!ticket) return res.status(404).json({ error: 'No valid ticket found' });

//     const bookedDistance = Math.abs(stopOrder.indexOf(ticket.destination) - stopOrder.indexOf(ticket.source));
//     const actualDistance = Math.abs(stopOrder.indexOf(actualDestination) - stopOrder.indexOf(ticket.source));
//     const extraDistance = actualDistance - bookedDistance;

//     let extraFare = 0;
//     if (extraDistance > 0) {
//       extraFare = extraDistance * farePerStop;
//       if (user.wallet < extraFare) {
//         return res.status(400).json({ error: 'Insufficient balance for extended trip' });
//       }
//       user.wallet -= extraFare;
//       await user.save();
//     }

//     ticket.status = 'used';
//     await ticket.save();

//     res.json({
//       message: `Trip completed. Extra fare: ₹${extraFare}`,
//       remainingBalance: user.wallet,
//     });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Admin route: view all tickets and users
// app.get('/admin/tickets', async (req, res) => {
//   try {
//     const tickets = await Ticket.find().sort({ createdAt: -1 });
//     res.json(tickets);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// app.get('/admin/users', async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://soumik:soumik1234@cluster0.wf3htff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cardUID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 0 },
    address:{type: String, required: true},
  currentTicket: {
    source: String,
    destination: String,
    fare: Number,
    entryGateTime: Date,
    exitGateTime: Date,
    status: String
  },
  ticketBookedAt: Date,
});

const User = mongoose.model('User', userSchema);

// const FARE_MATRIX = {
//   A: { B: 10, C: 20, D: 30, E: 40 },
//   B: { C: 10, D: 20, E: 30 },
//   C: { D: 10, E: 20 },
//   D: { E: 10 }
// };

const FARE_MATRIX = {
  A: { B: 10, C: 20, D: 30, E: 40 },
  B: { A: 10, C: 10, D: 20, E: 30 },
  C: { A: 20, B: 10, D: 10, E: 20 },
  D: { A: 30, B: 20, C: 10, E: 10 },
  E: { A: 40, B: 30, C: 20, D: 10 }
};

function calculateFare(source, destination) {
  return FARE_MATRIX[source]?.[destination] || 0;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'project0test2025@gmail.com', // replace with your email
    pass: 'Soumik@2025#' // replace with your app password or real password
  }
});

// app.post('/register', async (req, res) => {
//   try {
//     const { name, email, cardUID, address } = req.body;
//     const existing = await User.findOne({ cardUID });
//     if (existing) return res.status(400).json({ message: "Card already registered" });

//     const user = new User({ name, email, cardUID,address });
//     await user.save();
//     res.json({ message: "User registered", user });
//   } catch (err) {
//     res.status(500).json({ message: "Error registering user", error: err.message });
//   }
// });

// Example: Available Card UIDs


let availableCardUIDs = [
  "93563F29D3","03638328CB"
];

app.post('/register', async (req, res) => {
  try {
    const { name, email, address } = req.body;

    // Check if any cardUIDs are available
    if (availableCardUIDs.length === 0) {
      return res.status(400).json({ message: "No available cards. Please try later." });
    }

    // Assign the first available UID
    const cardUID = availableCardUIDs.shift(); // removes it from pool

    // Check if already registered (safety check)
    const existing = await User.findOne({ cardUID });
    if (existing) {
      return res.status(400).json({ message: "Card already registered" });
    }

    // Create new user
    const user = new User({ name, email, address, cardUID });
    await user.save();

    res.json({ 
      message: `User registered successfully. Your card with UID ${cardUID} will be delivered to your address: ${address}.`, 
      assignedCard: cardUID, 
      user 
    });

  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});


// Manually add wallet balance
app.post('/wallet/add', async (req, res) => {
  try {
    const { cardUID, amount } = req.body;
    const user = await User.findOne({ cardUID });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wallet += amount;
    await user.save();
    res.json({ message: "Balance added", wallet: user.wallet });
  } catch (err) {
    res.status(500).json({ message: "Error updating balance", error: err.message });
  }
});

app.post('/ticket/book', async (req, res) => {
  const { email, source, destination } = req.body;
  const fare = calculateFare(source, destination);
  if (!fare) return res.status(400).json({ message: 'Invalid route' });

  const user = await User.findOne({email});
  if (!user || user.wallet < fare) return res.status(400).json({ message: 'Insufficient balance' });

  user.wallet -= fare;
  user.currentTicket = {
    source,
    destination,
    fare,
    entryGateTime: null,
    exitGateTime: null,
    status: 'booked'
  };
  user.ticketBookedAt = new Date();
  await user.save();
  res.json({ message: 'Ticket booked', fare, wallet:user.wallet });
});

// app.post('/entry-gate', async (req, res) => {
//   const { cardUID } = req.body;
//   const user = await User.findOne({ cardUID });
//   if (!user?.currentTicket || user.currentTicket.status !== 'booked') {
//     return res.status(400).json({ message: 'No valid ticket found' });
//   }

//   user.currentTicket.entryGateTime = new Date();
//   user.currentTicket.status = 'in_progress';
//   await user.save();
//   res.json({ message: 'Entry granted' });
// });


// in server.js

app.post('/entry-gate', async (req, res) => {
  console.log('✅ Request received at /entry-gate with body:', req.body);
  
  // Use a try...catch block to prevent server crashes
  try { 
    const { cardUID } = req.body;
    if (!cardUID) {
      return res.status(400).json({ message: "cardUID not provided" });
    }

    const user = await User.findOne({ cardUID });

    // IMPORTANT CHECK: Make sure user is not null before proceeding
    if (!user) {
      console.log(`🚫 Access Denied: Card ${cardUID} is not registered.`);
      return res.status(404).json({ message: 'Card not registered' });
    }
    
    if (!user.currentTicket || user.currentTicket.status !== 'booked') {
      console.log(`🚫 Access Denied: No valid ticket for user ${user.name}.`);
      return res.status(400).json({ message: 'No valid ticket found' });
    }

    user.currentTicket.entryGateTime = new Date();
    user.currentTicket.status = 'in_progress';
    await user.save();

    console.log(`✅ Access Granted for ${user.name}.`);
    res.json({ message: 'Entry granted' });

  } catch (error) {
    // If any other error occurs, log it and send a 500 server error response
    console.error('❌ An error occurred in /entry-gate:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/exit-gate', async (req, res) => {
  const { cardUID, actualDestination } = req.body;
  const user = await User.findOne({ cardUID });
  if (!user?.currentTicket || user.currentTicket.status !== 'in_progress') {
    return res.status(400).json({ message: 'Invalid exit attempt' });
  }

  const originalFare = user.currentTicket.fare;
  const newFare = calculateFare(user.currentTicket.source, actualDestination);
  const extraFare = newFare - originalFare;
  if (extraFare > 0 && user.wallet < extraFare) {
    return res.status(400).json({ message: 'Insufficient balance for extended travel' });
  }

  user.wallet -= Math.max(0, extraFare);
  user.currentTicket.exitGateTime = new Date();
  user.currentTicket.destination = actualDestination;
  user.currentTicket.fare = newFare;
  user.currentTicket.status = 'completed';
  await user.save();
  res.json({ message: 'Exit granted', finalFare: newFare });
});

app.get('/admin/bookings', async (req, res) => {
  const users = await User.find({}, 'name cardUID currentTicket wallet tickedBookedAt');
  res.json(users);
});

app.get('/dashboard/mydashboard', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Find the user in the database by their email
    const user = await User.findOne({ email }, 'name email cardUID wallet');

    if (!user) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // If found, send back their data
    res.json(user);

  } catch (error) {
    console.error("Error fetching user data by email:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Cron job to expire tickets after 30 mins
// cron.schedule('*/5 * * * *', async () => {
//   const expiryLimit = new Date(Date.now() - 30 * 60000);
//   const expiredUsers = await User.find({ ticketBookedAt: { $lte: expiryLimit }, 'currentTicket.status': { $ne: 'completed' } });

//   for (let user of expiredUsers) {
//     user.currentTicket = null;
//     user.ticketBookedAt = null;
//     await user.save();

//     if (user.email) {
//       transporter.sendMail({
//         from: 'project0test2025@gmail.com',
//         to: user.email,
//         subject: 'Bus Ticket Expired',
//         text: `Hi ${user.name}, your ticket from ${user.currentTicket?.source} to ${user.currentTicket?.destination} has expired.`
//       }, (err, info) => {
//         if (err) console.error('Email failed:', err);
//         else console.log('Email sent:', info.response);
//       });
//     }
//   }

//   console.log(`[CRON] Expired tickets cleaned: ${expiredUsers.length}`);
// });

app.listen(PORT, () => console.log(`Server running on port http://192.168.137.63:${PORT}`));

