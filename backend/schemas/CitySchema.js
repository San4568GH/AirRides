import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const CitySchema = mongoose.model('City', citySchema);

export default CitySchema;
