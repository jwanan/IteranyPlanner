const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  vibe: {
    type: String,
    required: true,
  },
  airportCode: {
    type: String,
    required: true,
  },
});

const City = mongoose.model('City', citySchema);

module.exports = City;
