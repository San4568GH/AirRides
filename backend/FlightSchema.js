import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    flightNumber:{type:String,required:true},
    from: { type: String, required: true },
    to: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    estimatedFlightTime: { type: String, required: true },
    airline: { type: String, required: true },
    price: { type: Number, required: true },
    nonStop: { type: Boolean, required: true },
    seatsAvailable: { type: Number, required: true },
});

const Flight = mongoose.model('Flight', flightSchema);
export default Flight;
