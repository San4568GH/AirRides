import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import CitySchema from './CitySchema.js';
import UserSchema from './UserSchema.js';
import Flight from './FlightSchema.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';


dotenv.config();
const app = express();
const PORT = 4000;
const SECRET_KEY = '23ueid0jfp4wdh2wwa';
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// Middleware
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
// app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully!'))
.catch((error) => console.error('MongoDB connection error:', error));

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Create new user
    const newUser = new UserSchema({
      username,
      email,
      password,
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      // Check if the provided credentials match the default admin credentials
      const isAdmin = (username === process.env.ADMIN_USERNAME) &&
      (email === process.env.ADMIN_EMAIL) &&
      (password === process.env.ADMIN_PASSWORD);  
      // If it's not admin, proceed to regular login
      if (!isAdmin) {
        const user = await UserSchema.findOne({ username, email });
  
        if (!user) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }
  
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
  
        if (!isMatch) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }
  
        // Generate JWT token for regular user
        const token = jwt.sign({ userId: user._id, username: user.username, isAdmin: false }, SECRET_KEY, { expiresIn: '1h' });
  
        res.cookie('token', token, { httpOnly: true });
        return res.status(200).json({ message: 'Login successful', isAdmin: false });
      }
  
      // If it's admin, generate JWT token for admin
      const token = jwt.sign({ userId: null, username: 'admin', isAdmin: true }, SECRET_KEY, { expiresIn: '1h' });
  
      res.cookie('token', token, { httpOnly: true });
      res.status(200).json({ message: 'Login successful', isAdmin: true });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });


  //Profile Reading by cookies and JSONwebtoken
app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized access, token missing' });
  }

  jwt.verify(token, SECRET_KEY, (err, info) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized access, token invalid' });
    }
    res.json(info);
  });
});

//Logout function
app.post('/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out' });
});
  

// Add city endpoint
app.post('/cities', async (req, res) => {
  const { name } = req.body;

  try {
    const newCity = new CitySchema({ name });
    await newCity.save();
    res.status(201).json({ message: 'City added successfully' });
  } catch (error) {
    if (error.code === 11000) { 
      res.status(400).json({ message: 'City already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});


// Get cities endpoint
app.get('/cities', async (req, res) => {
  try {
    const cities = await CitySchema.find({});
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/flights', async (req, res) => {
  const { flightNumber,from, to, departureTime, arrivalTime, estimatedFlightTime, airline, price, nonStop, seatsAvailable } = req.body;

  try {
    const newFlight = new Flight({
      flightNumber,
      from,
      to,
      departureTime,
      arrivalTime,
      estimatedFlightTime,
      airline,
      price,
      nonStop,
      seatsAvailable,
    });
    await newFlight.save();
    res.status(201).json({ message: 'Flight added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/flights', async (req, res) => {
  try {
    const flights = await Flight.find();
    res.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

// Search flights endpoint
app.post('/flights/search', async (req, res) => {
  const { from, to, departureDate, returnDate, roundTrip } = req.body;

  try {
    let searchCriteria = {
      from: new RegExp(from, 'i'),
      to: new RegExp(to, 'i'),
      departureTime: {
        $gte: new Date(new Date(departureDate).setHours(0, 0, 0)),
        $lt: new Date(new Date(departureDate).setHours(23, 59, 59)),
      },
    };

    if (roundTrip) {
      searchCriteria.arrivalTime = {
        $gte: new Date(new Date(returnDate).setHours(0, 0, 0)),
        $lt: new Date(new Date(returnDate).setHours(23, 59, 59)),
      };
    }

    const flights = await Flight.find(searchCriteria);

    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to create an order
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // amount in the smallest currency unit (paise)
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to store booking information
app.post('/store-booking', async (req, res) => {
  const { userId, flightId, passengers } = req.body;

  try {
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    const bookedFlight = {
      flightId: flight._id,
      flightNumber: flight.flightNumber,
      from: flight.from,
      to: flight.to,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      airline: flight.airline,
      price: flight.price,
      nonStop: flight.nonStop,
      bookingDate: new Date(),
      passengers: passengers,
    };

    const user = await UserSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.bookedFlights.push(bookedFlight);
    await user.save();

    res.status(200).json({ message: 'Booking stored successfully' });
  } catch (error) {
    console.error('Error storing booking:', error);
    res.status(500).json({ error: 'Failed to store booking' });
  }
});

// Route to verify payment and store booking
app.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, flightId, passengers, userId } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature === razorpay_signature) {
    try {
      await Flight.findByIdAndUpdate(flightId, { $inc: { seatsAvailable: -passengers } });

      // Store booking information after payment verification
      await app.post('/store-booking', {
        userId,
        flightId,
        passengers
      });

      res.json({ status: 'Payment Verified Successfully' });
    } catch (error) {
      res.status(500).send({ status: 'failure', error: 'Failed to update flight seats or store booking' });
    }
  } else {
    res.status(400).send({ status: 'failure', error: 'Invalid payment signature' });
  }
});

// Route to verify payment status
app.post('/verify-payment-status', async (req, res) => {
  const { paymentId } = req.body;

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.status === 'captured') {
      res.status(200).json({ message: 'Payment successful' });
    } else {
      res.status(400).json({ error: 'Payment not captured' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// app.get('/booked-flights', async (req, res) => {
//   const userId = req.user._id;

//   try {
//     const user = await UserSchema.findById(userId).populate('bookedFlights').exec();
//     if (user && user.bookedFlights) {
//       res.json(user.bookedFlights);
//     } else {
//       res.json([]);
//     }
//   } catch (error) {
//     console.error('Error fetching booked flights:', error);
//     res.status(500).send({ error: 'Failed to fetch booked flights' });
//   }
// });



// Middleware to verify JWT token from cookies
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.userId = decoded.userId;
    next();
  });
};

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Protected route accessed successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
