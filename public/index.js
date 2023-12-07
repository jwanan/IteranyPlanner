function redirectTo(page) {
    window.location.href = page;
}

var departureCities = ["New Delhi", "New York", "Vienna", "Malta", "Santorini", "Zurich", "Bergen", "Budapest"];

// Function to make the api call
async function makeApiCall(sourceCity, vibeCity, departureDate, returnDate) {
    try {
        const response = await fetch('/makeApiCall', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sourceCity,
                vibeCity,
                departureDate,
                returnDate,
            }),
        });

        if (!response.ok) {
            throw new Error('Error making API call');
        }

        try {
            // Use await to properly get the JSON data from the response
            const apiResponse = await response.json();
            return apiResponse;
        } catch (error) {
            console.error(error);
        }
    } catch (error) {
        console.error('Error in makeApiCall function:', error);
    }
}

async function validateForm(event) {
    event.preventDefault();
    var departureCity = document.getElementById("departureCity").value;
    var vibeCity = document.getElementById("vibeCity").value;
    var departureDate = document.getElementById("departureDate").value;
    var returnDate = document.getElementById("returnDate").value;

    // Check if required fields are filled
    if (!departureCity || !vibeCity || !departureDate) {
        alert("Departure city, vibe, and departure date are required fields.");
        return false; // Prevent form submission
    }

    // Check if departure date is not before today's date
    var today = new Date().toISOString().split("T")[0];
    if (departureDate < today) {
        alert("Departure date cannot be before today's date.");
        return false; // Prevent form submission
    }

    // Check if return date is not before departure date
    if (returnDate && returnDate < departureDate) {
        alert("Return date cannot be before departure date.");
        return false; // Prevent form submission
    }

    // Check if the entered departure city is valid
    if (!departureCities.includes(departureCity)) {
        alert("Invalid departure city. Please select a city from the list.");
        return false; // Prevent form submission
    }

    // Make an API call with relevant data
    try {
        const apiResponse = await makeApiCall(departureCity, vibeCity, departureDate, returnDate);

        // Store flights data in localStorage
        localStorage.setItem('flightsData', JSON.stringify(apiResponse.flights));

        // Redirect to flightDetails.html
        window.location.href = 'flightDetails.html';

        return true; // Allow form submission
    } catch (error) {
        // Handle error
        console.error('Error:', error.message);
        return false; // Prevent form submission in case of an error
    }
}