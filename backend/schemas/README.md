# Database Schemas

This directory contains all MongoDB schema definitions for the Airlines application.

## Files

### Core Schemas
- **`UserSchema.js`** - User accounts, authentication, and profile data
- **`CitySchema.js`** - Available cities for flight destinations
- **`FlightSchema.js`** - Flight information, schedules, and pricing

### Utilities
- **`index.js`** - Central export point for all schemas

## Schema Structure

### UserSchema
```javascript
{
  name: String,           // User's full name
  username: String,       // Unique username (required)
  email: String,          // Email address (required, unique)
  password: String,       // Hashed password (required)
  phone: String,          // Phone number
  age: Number,            // Age (0-120)
  gender: String,         // 'Male', 'Female', 'Other'
  role: String,           // 'passenger', 'staff', 'admin'
  bookedFlights: Array,   // Array of booked flight objects
  timestamps: true        // createdAt, updatedAt
}
```

### CitySchema
```javascript
{
  name: String            // City name (required, unique)
}
```

### FlightSchema
```javascript
{
  flightNumber: String,        // Flight identifier (required)
  from: String,               // Origin city (required)
  to: String,                 // Destination city (required)
  departureTime: Date,        // Departure datetime (required)
  arrivalTime: Date,          // Arrival datetime (required)
  estimatedFlightTime: String, // Duration string (required)
  airline: String,            // Airline name (required)
  price: Number,              // Ticket price (required)
  nonStop: Boolean,           // Direct flight flag (required)
  seatsAvailable: Number      // Available seats (required)
}
```

## Usage

### Individual Import
```javascript
import UserSchema from './schemas/UserSchema.js';
import CitySchema from './schemas/CitySchema.js';
import FlightSchema from './schemas/FlightSchema.js';
```

### Bulk Import (from index)
```javascript
import { UserSchema, CitySchema, FlightSchema } from './schemas/index.js';
```

## Migration

If you have existing data and need to migrate to new schema versions, use the migration script:

```bash
node migrate-users.js
```

This will safely update existing records to be compatible with new schema fields.

## Notes

- All schemas use Mongoose ODM
- UserSchema includes password hashing middleware
- Unique constraints are enforced where specified
- Role-based access control is implemented through the UserSchema role field
