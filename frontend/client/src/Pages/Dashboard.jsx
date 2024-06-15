import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../UserContext';

export default function Dashboard() {
    const { userInfo } = useContext(UserContext);
    const [bookedFlights, setBookedFlights] = useState([]);
  
    useEffect(() => {
      if (userInfo && userInfo.bookedFlights) {
        setBookedFlights(userInfo.bookedFlights);
      }
    }, [userInfo]);
  
    return (
      <div>
        <h1>Your Booked Flights</h1>
        {bookedFlights.length > 0 ? (
          <ul>
            {bookedFlights.map((flight, index) => (
              <li key={index}>
                <p>Flight Number: {flight.flightNumber}</p>
                <p>From: {flight.from}</p>
                <p>To: {flight.to}</p>
                <p>Departure: {new Date(flight.departureTime).toLocaleString()}</p>
                <p>Arrival: {new Date(flight.arrivalTime).toLocaleString()}</p>
                <p>Airline: {flight.airline}</p>
                <p>Price: {flight.price} x {flight.passengers}</p>
                <p>Total Price: {flight.price * flight.passengers}</p>
                <p>Booking Date: {new Date(flight.bookingDate).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No booked flights</p>
        )}
      </div>
    );
  }
  