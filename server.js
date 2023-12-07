// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/brownydata', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Sign-up route
app.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and Confirm Password do not match' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ fullName, email, password: hashedPassword });

    try {
      // Attempt to save the new user
      await newUser.save();
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      // Handle unique constraint violation
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ message: 'Email already exists. Please use a different email address.' });
      }

      // Handle other errors
      console.error(error);
      res.status(500).json({ message: 'Error creating user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Root route
app.get('/', (req, res) => {
  // Send the HTML file when accessing the root path
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Password is valid, send success response or token
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during login' });
  }
});

const City = require('./models/city');

async function getCitiesByVibe(vibe) {
  try {
    const cities = await City.find({ vibe: vibe }).exec();
    return cities;
  } catch (error) {
    console.error(error);
    throw new Error('Error getting cities by vibe');
  }
}

async function apiCallGetAirportId(cityName) {
  cityName = cityName.trim();
  const options = {
    method: 'GET',
    url: 'https://sky-scrapper1.p.rapidapi.com/api/v1/flights/searchAirport',
    params: {
      query: 'Budapest',
      currency: 'HUF',
      market: 'HU',
      locale: 'hu-HU'
    },
    headers: {
      'X-RapidAPI-Key': 'key-goes-here',
      'X-RapidAPI-Host': 'sky-scrapper1.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);

    // Ensure that response.data is an array, even if it's a single item
    const dataArray = Array.isArray(response.data) ? response.data : [response.data];
    
    if (dataArray && dataArray.length > 0) {
      // Extracting the ID of the first airport in the array
      const firstAirport = dataArray[0];
      return firstAirport.data[0].id;
    } else {
      throw new Error('No airport found for the given city');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching airport data');
  }
}

// Make API call
async function makeApiCall(sourceCity, relevantCities, departureDate, returnDate) {
  try {
    // Get the ID for the source city
    const fromId = await apiCallGetAirportId(sourceCity);

    // Get the IDs for relevant cities
    const toIds = await Promise.all(relevantCities.map(city => apiCallGetAirportId(city)));
    
    const apiUrl = 'https://sky-scrapper1.p.rapidapi.com/api/v1/flights/searchFlights';

    // Array to store responses for each destination
    const responses = [];

    // Loop through each destination
    for (const toId of toIds) {
      const options = {
        method: 'GET',
        url: apiUrl,
        params: {
          fromId,
          toId,
          date: '2023-12-09',
          returnDate: '2023-12-12',
          currency: 'HUF',
          market: 'HU',
          locale: 'hu-HU'
        },
        headers: {
          'X-RapidAPI-Key': 'key-goes-here',
          'X-RapidAPI-Host': 'sky-scrapper1.p.rapidapi.com'
        }
      };

      // Make API call for the current destination
      const response = await axios.request(options);
      
      // Store the response for the current destination
      responses.push(response.data);
    }

    // Return the array of responses
    return responses;

  } catch (error) {
    console.error(error);
    throw new Error('Error making API calls');
  }
}

app.post('/makeApiCall', async (req, res) => {
  try {
    const { sourceCity, vibeCity, departureDate, returnDate } = req.body;

    const relevantCities = await getCitiesByVibe(vibeCity);

    // Extract only the names of the cities from relevantCities
    const relevantCitiesNames = relevantCities.map(city => city.name);

    // Remove sourceCity from relevantCitiesNames if it is present
    const sourceCityIndex = relevantCitiesNames.indexOf(sourceCity);
    if (sourceCityIndex !== -1) {
      relevantCitiesNames.splice(sourceCityIndex, 1);
    }
    
    // Validate and sanitize data before making the API call

    // Read the contents of the test.json file
    const filePath = path.join(__dirname, 'public', 'test.json');
    const fileContents = require(filePath);

    // Instead of making the API call, use the fileContents as the API response
    const apiResponse = fileContents;

    // Additional logic with the API response

    // Extracting relevant information from the API response
    const flights = apiResponse.data.itineraries.map((itinerary) => {
      const leg = itinerary.legs[0]; // Assuming there's only one leg for simplicity

      return {
        from: leg.origin.city,
        to: leg.destination.city,
        price: itinerary.price.formatted,
        duration: leg.durationInMinutes,
        layoverAirports: leg.segments.slice(1).map((segment) => segment.origin.name),
        layoverDuration: leg.segments.slice(1).map((segment) => segment.durationInMinutes),
      };
    });

    // Send the API response as part of the response
    res.status(200).json({
      message: 'API call completed successfully',
      flights: Array.isArray(flights) ? flights : [flights]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error making API call' });
  }
});