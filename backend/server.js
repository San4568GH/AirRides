import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import CitySchema from './schemas/CitySchema.js';
import UserSchema from './schemas/UserSchema.js';
import Flight from './schemas/FlightSchema.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from './utils/config.js';
import { generateUniqueBookingId } from './utils/bookingUtils.js';


const app = express();

// Initialize Razorpay according to official documentation
let razorpay;
try {
  // Validate API keys first
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw new Error('Razorpay API keys are missing in environment variables');
  }
  
  if (!config.razorpay.keyId.startsWith('rzp_')) {
    throw new Error('Invalid Razorpay Key ID format. Should start with "rzp_"');
  }
  
  // Initialize Razorpay instance with proper options
  razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
  
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error.message);
  console.error('Full error:', error);
  console.error('Please check your .env file and ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correctly set');
  process.exit(1);
}


// Middleware
app.use(cors({ 
  credentials: true, 
  origin: config.server.clientUrl
}));
// app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(config.database.mongoUrl, {
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
      // First check if credentials match Master Admin from .env
      const isMasterAdmin = (username === config.admin.username) &&
                           (email === config.admin.email) &&
                           (password === config.admin.password);
      
      if (isMasterAdmin) {
        // Generate JWT token for Master Admin
        const token = jwt.sign({ 
          userId: 'master', 
          username: config.admin.username, 
          isMasterAdmin: true,
          isAdmin: true 
        }, config.server.jwtSecret, { expiresIn: '1h' });
        
        res.cookie('token', token, { httpOnly: true });
        
        return res.status(200).json({ 
          message: 'Login successful', 
          isAdmin: true,
          isMasterAdmin: true,
          userInfo: {
            username: config.admin.username,
            email: config.admin.email,
            role: 'master-admin',
            adminType: 'Master Admin'
          }
        });
      }

      // Check database for assigned admin or regular users
      const user = await UserSchema.findOne({ 
        $and: [
          { $or: [{ username }, { email }] },
          { $or: [{ username }, { email: email }] }
        ]
      });

      if (user) {
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
  
        if (!isMatch) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check if user is assigned admin
        const isAssignedAdmin = user.role === 'admin';
  
        // Generate JWT token
        const token = jwt.sign({ 
          userId: user._id, 
          username: user.username, 
          isMasterAdmin: false,
          isAdmin: isAssignedAdmin 
        }, config.server.jwtSecret, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true });
        
        return res.status(200).json({ 
          message: 'Login successful', 
          isAdmin: isAssignedAdmin,
          isMasterAdmin: false,
          userInfo: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            adminType: isAssignedAdmin ? 'Assigned Admin' : 'User',
            phone: user.phone,
            age: user.age,
            gender: user.gender
          }
        });
      }

      // No valid credentials found
      return res.status(400).json({ error: 'Invalid credentials' });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });


  //Profile Reading by cookies and JSONwebtoken
app.get('/profile', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized access, token missing' });
  }

  jwt.verify(token, config.server.jwtSecret, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized access, token invalid' });
    }

    try {
      // If it's Master Admin
      if (info.isMasterAdmin) {
        return res.json({
          userId: 'master',
          username: config.admin.username,
          email: config.admin.email,
          role: 'master-admin',
          adminType: 'Master Admin',
          isMasterAdmin: true,
          isAdmin: true
        });
      }

      // If it's a regular user or assigned admin, fetch from database
      if (info.userId && info.userId !== 'master') {
        const user = await UserSchema.findById(info.userId);
        if (user) {
          const isAssignedAdmin = user.role === 'admin';
          
          // Convert bookedFlights to plain objects to ensure all fields are included
          const bookedFlights = user.bookedFlights ? user.bookedFlights.map(booking => {
            const bookingObj = booking.toObject ? booking.toObject() : booking;
            
            // Ensure bookingId is present, generate if missing
            if (!bookingObj.bookingId) {
              bookingObj.bookingId = generateUniqueBookingId();
            }
            
            return bookingObj;
          }) : [];
          
          return res.json({
            id: user._id,
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            adminType: isAssignedAdmin ? 'Assigned Admin' : 'User',
            phone: user.phone,
            age: user.age,
            gender: user.gender,
            isAdmin: isAssignedAdmin,
            isMasterAdmin: false,
            bookedFlights: bookedFlights
          });
        }
      }

      // Fallback - return basic info from JWT
      res.json({
        ...info,
        role: info.isAdmin ? 'admin' : 'passenger'
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Server error while fetching profile' });
    }
  });
});

//Logout function
app.post('/logout', (req, res) => {
  // Clear the token cookie with all necessary options
  res.cookie('token', '', { 
    httpOnly: true, 
    expires: new Date(0),
    path: '/',
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax'
  });
  res.json({ message: 'Logged out successfully' });
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

// Get Razorpay key ID for frontend (public information)
app.get('/razorpay-key', (req, res) => {
  try {
    if (!config.razorpay.keyId) {
      return res.status(500).json({
        error: 'CONFIGURATION_ERROR',
        description: 'Razorpay key not configured'
      });
    }

    res.json({
      key_id: config.razorpay.keyId
    });
  } catch (error) {
    res.status(500).json({
      error: 'SERVER_ERROR',
      description: 'Failed to retrieve Razorpay key'
    });
  }
});

// Test endpoint to verify Razorpay configuration
app.get('/test-razorpay', (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        status: 'error',
        message: 'Razorpay not initialized',
        config: {
          keyId: config.razorpay.keyId ? 'Present' : 'Missing',
          keySecret: config.razorpay.keySecret ? 'Present' : 'Missing'
        }
      });
    }

    res.json({
      status: 'success',
      message: 'Razorpay is properly configured',
      keyId: config.razorpay.keyId.slice(0, 10) + '...',
      version: 'v2.9.4',
      environment: config.razorpay.keyId.includes('test') ? 'test' : 'live'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error checking Razorpay configuration',
      error: error.message
    });
  }
});

// Route to create an order - Following Razorpay API documentation
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  // Validate request parameters
  if (!amount || amount <= 0) {
    return res.status(400).json({ 
      error: 'BAD_REQUEST_ERROR',
      description: 'Invalid amount provided. Amount must be a positive number.' 
    });
  }

  // Prepare order options according to Razorpay documentation
  const options = {
    amount: Math.round(amount * 100), // amount in paise (smallest currency unit)
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: {
      order_type: 'flight_booking',
      created_at: new Date().toISOString()
    }
  };

  try {
    if (!razorpay) {
      throw new Error('Razorpay instance not initialized');
    }
    
    const order = await razorpay.orders.create(options);
    
    // Return successful response (201 Created)
    res.status(201).json({
      id: order.id,
      entity: order.entity,
      amount: order.amount,
      amount_paid: order.amount_paid,
      amount_due: order.amount_due,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      attempts: order.attempts,
      notes: order.notes,
      created_at: order.created_at
    });
    
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    
    // Handle specific Razorpay errors
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.error?.code || 'RAZORPAY_ERROR',
        description: error.error?.description || error.message
      });
    }
    
    // Handle general errors
    res.status(500).json({ 
      error: 'SERVER_ERROR',
      description: 'Failed to create payment order. Please try again.',
      details: error.message 
    });
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

    const generateBookingId = () => {
      return generateUniqueBookingId();
    };

    const bookedFlight = {
      bookingId: generateBookingId(),
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

// Route to verify payment and store booking - Following Razorpay documentation
app.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, flightId, passengers, userId } = req.body;

  try {
    // Validate required parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        status: 'failure', 
        error: 'BAD_REQUEST_ERROR',
        description: 'Missing required payment verification parameters' 
      });
    }

    // Verify payment signature according to Razorpay documentation
    const hmac = crypto.createHmac('sha256', config.razorpay.keySecret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    console.log('Payment verification:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature_match: generatedSignature === razorpay_signature
    });

    if (generatedSignature === razorpay_signature) {
      // Payment signature is valid - proceed with booking
      
      // Update flight seats
      const flight = await Flight.findById(flightId);
      if (!flight) {
        return res.status(404).json({ 
          status: 'failure', 
          error: 'NOT_FOUND',
          description: 'Flight not found' 
        });
      }

      if (flight.seatsAvailable < passengers) {
        return res.status(400).json({ 
          status: 'failure', 
          error: 'INSUFFICIENT_SEATS',
          description: 'Not enough seats available' 
        });
      }

      await Flight.findByIdAndUpdate(flightId, { $inc: { seatsAvailable: -passengers } });

      // Store booking information
      const generateBookingId = () => {
        return generateUniqueBookingId();
      };

      const bookingId = generateBookingId();

      const bookedFlight = {
        bookingId: bookingId,
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
        paymentDetails: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        }
      };

      const user = await UserSchema.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          status: 'failure', 
          error: 'NOT_FOUND',
          description: 'User not found' 
        });
      }

      // Ensure bookedFlights array exists
      if (!user.bookedFlights) {
        user.bookedFlights = [];
      }

      user.bookedFlights.push(bookedFlight);
      await user.save();

      res.status(200).json({ 
        status: 'success',
        message: 'Payment verified and booking confirmed successfully',
        booking_id: bookedFlight.bookingId,
        payment_id: razorpay_payment_id
      });
      
    } else {
      console.log('❌ Payment signature verification failed');
      res.status(400).json({ 
        status: 'failure', 
        error: 'SIGNATURE_VERIFICATION_FAILED',
        description: 'Invalid payment signature' 
      });
    }
    
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ 
      status: 'failure', 
      error: 'SERVER_ERROR',
      description: 'Payment verification failed due to server error',
      details: error.message 
    });
  }
});

// Route to verify payment status
app.post('/verify-payment-status', async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  try {
    if (!razorpay) {
      throw new Error('Razorpay not initialized');
    }
    
    const payment = await razorpay.payments.fetch(paymentId);
    console.log('Payment status checked:', payment.status);
    
    if (payment.status === 'captured') {
      res.status(200).json({ message: 'Payment successful', status: payment.status });
    } else {
      res.status(400).json({ error: 'Payment not captured', status: payment.status });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment status',
      details: error.message 
    });
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

  jwt.verify(token, config.server.jwtSecret, (err, decoded) => {
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

// Check if admin exists (Master Admin always exists, check for Assigned Admin)
app.get('/check-admin', async (req, res) => {
  try {
    // Master Admin always exists (from .env), so check if we need assigned admin setup
    const assignedAdmin = await UserSchema.findOne({ role: 'admin' });
    const masterAdminExists = true; // Master Admin always exists from .env
    
    res.json({ 
      adminExists: masterAdminExists || !!assignedAdmin,
      masterAdminExists: masterAdminExists,
      assignedAdminExists: !!assignedAdmin
    });
  } catch (error) {
    console.error('Error checking for admin:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Setup assigned admin (create additional admin users)
app.post('/setup-super-admin', async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await UserSchema.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Create new assigned admin user
    const newAdmin = new UserSchema({
      name,
      username,
      email,
      password,
      role: 'admin'
    });

    await newAdmin.save();

    res.status(201).json({ 
      message: 'Assigned admin created successfully',
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        username: newAdmin.username,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('Error creating assigned admin:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin only)
app.get('/users', async (req, res) => {
  try {
    const users = await UserSchema.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new user (admin only)
app.post('/users', async (req, res) => {
  try {
    const { name, email, username, password, phone, age, gender, role } = req.body;

    // Check if user already exists
    const existingUser = await UserSchema.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    const newUser = new UserSchema({
      name,
      username,
      email,
      password,
      phone,
      age,
      gender,
      role: role || 'passenger'
    });

    await newUser.save();

    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        phone: newUser.phone,
        age: newUser.age,
        gender: newUser.gender,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (admin only)
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, age, gender, role } = req.body;

    const updatedUser = await UserSchema.findByIdAndUpdate(
      id,
      { name, email, phone, age, gender, role },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await UserSchema.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(config.server.port, () => {
  console.log(`Server running on http://localhost:${config.server.port}`);
  console.log(`Environment: ${config.server.environment}`);
});
