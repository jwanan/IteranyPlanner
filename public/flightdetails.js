// flightDetails.js
function redirectTo(page) {
    window.location.href = page;
}

// Function to display flight details on the page
function displayFlightDetails(flights) {
    const container = document.getElementById('flightDetailsContainer');

    // Check if there are no flights
    if (flights.length === 0) {
        container.innerHTML = '<p>No flights available.</p>';
        return;
    }

    // Display details for the first 10 flights
    for (let i = 0; i < Math.min(10, flights.length); i++) {
        const flight = flights[i];

        // Create card element for each flight
        const card = document.createElement('div');
        card.className = 'card mb-3';

        // Card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        // Create elements to display flight details
        const flightDetailsElement = document.createElement('div');
        flightDetailsElement.innerHTML = `
            <div class="row">
            <div class="col-md-6">
                <p class="card-text text-left">From: ${flight.from}</p>
            </div>
            <div class="col-md-6">
                <p class="card-text text-right">To: ${flight.to}</p>
            </div>
            <div class="col-md-6">
                <p class="card-text text-left">Price: ${flight.price}</p>
            </div>
            <div class="col-md-6">
                <img src="images/orange-plane-hi.png" align="left"alt="Plane Image" style="width: 10%; style="height: 10%">
                <p class="card-text text-right">Layover: ${flight.layoverAirports}</p>
                <p class="card-text text-right">Layover Duration: ${flight.layoverDuration}</p>
            </div>
            </div>
        `;

        // Append the details to the card body
        cardBody.appendChild(flightDetailsElement);
        card.appendChild(cardBody);

        // Append the card to the container
        container.appendChild(card);
    }
}

// Retrieve flights data from localStorage
const flightsData = localStorage.getItem('flightsData');

// Parse the JSON string to get the flights array
const flightsArray = JSON.parse(flightsData);

// Call the displayFlightDetails function with the flights data
displayFlightDetails(flightsArray);