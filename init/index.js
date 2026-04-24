const mongoose = require('mongoose');
const initData = require("./data.js");
const Listing = require('../models/listing.js');
const axios = require('axios');

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

let initDb = async () => {
    // Step 1: Clear the existing database listings
    await Listing.deleteMany({});
    
    // Step 2: Add an owner to all our dummy listings
    const updatedData = initData.data.map(obj => ({
        ...obj,
        owner: "69e86955a787ca95db528b48"
    }));

    console.log("Geocoding locations. This may take a moment...");
    
    // Step 3: Loop through each individual listing to grab its specific coordinates
    for (let i = 0; i < updatedData.length; i++) {
        let listing = updatedData[i];
        
        try {
            // Step 4: Prepare the API request with the location
            const query = encodeURIComponent(`${listing.location}, ${listing.country}`);
            const link = `https://nominatim.openstreetmap.org/search?q=${query}&format=json`;
            
            // Send the request
            const response = await axios.get(link, {
                headers: { 'User-Agent': 'AirbnbCloneApp/1.0' }
            });
            
            // Step 5: If the API finds coordinates, add them to the listing
            if (response.data && response.data.length > 0) {
                let { lat, lon } = response.data[0];
                listing.geometry = {
                    type: "Point",
                    coordinates: [parseFloat(lon), parseFloat(lat)] // MongoDB needs [longitude, latitude]
                };
            } else {
                // Step 6: Fallback coordinates if the API finds nothing
                listing.geometry = {
                    type: "Point",
                    coordinates: [77.2090, 28.6139] // New Delhi
                };
            }
            console.log(`Geocoded: ${listing.location}`);
            
        } catch (err) {
            console.log(`Error geocoding ${listing.location}: ${err.message}`);
            listing.geometry = { type: "Point", coordinates: [77.2090, 28.6139] };
        }
        
        // Step 7: Wait 1 second before making the next request to prevent getting blocked by the API
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 8: Insert all the fully prepared listings into MongoDB
    await Listing.insertMany(updatedData);
    console.log("Initialised successfully with Geocoding!");
    
    // Disconnect so the terminal doesn't hang
    mongoose.connection.close();
}

initDb();