import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;
const bookedFlightSchema = new Schema({
  flightId: {
    type: Schema.Types.ObjectId,
    ref: 'Flight',
    required: true,
  },
  flightNumber: String,
  from: String,
  to: String,
  departureTime: Date,
  arrivalTime: Date,
  airline: String,
  price: Number,
  nonStop: Boolean,
  bookingDate: Date,
  passengers: Number,
});


const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
    min: 0,
    max: 120,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  role: {
    type: String,
    enum: ['passenger', 'staff', 'admin'],
    default: 'passenger',
  },
  bookedFlights: [bookedFlightSchema],
}, {
  timestamps: true,
});

// Hash the password before saving the user model
userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const UserSchema = mongoose.model('User', userSchema);

export default UserSchema;
