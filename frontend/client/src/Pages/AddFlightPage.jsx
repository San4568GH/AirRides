import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns'; // Import format from date-fns for date formatting

const initialFormData = {
  flightNumber: '',
  from: '',
  to: '',
  departureTime: null,
  arrivalTime: null,
  estimatedFlightTime: '',
  airline: '',
  price: '',
  nonStop: false,
  seatsAvailable: '',
};

export default function AddFlightForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [flights, setFlights] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('http://localhost:4000/cities');
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await fetch('http://localhost:4000/flights');
        const data = await response.json();
        setFlights(data);
      } catch (error) {
        console.error('Failed to fetch flights:', error);
      }
    };

    fetchFlights();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to add flight');
        throw new Error(error.error || 'Failed to add flight');
      }

      alert('Flight added successfully');
      setFormData(initialFormData);
      fetchFlights(); // Refresh flight list after adding new flight
    } catch (error) {
      console.error('Failed to add flight:', error);
    }
  };

  return (
    <div className="add-flight">
      <h1>Add Flight</h1>
      <form onSubmit={handleSubmit}>
      <div className="form-group">
          <label htmlFor="flightNumber">Flight Number:</label>
          <input
            type="text"
            id="flightNumber"
            name="flightNumber"
            value={formData.flightNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="from">From:</label>
          <input
            type="text"
            id="from"
            name="from"
            list="from-cities"
            value={formData.from}
            onChange={handleChange}
            required
          />
          <datalist id="from-cities">
            {cities.map((city) => (
              <option key={city._id} value={city.name} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="to">To:</label>
          <input
            type="text"
            id="to"
            name="to"
            list="to-cities"
            value={formData.to}
            onChange={handleChange}
            required
          />
          <datalist id="to-cities">
            {cities.map((city) => (
              <option key={city._id} value={city.name} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="departureTime">Departure Time:</label>
          <DatePicker
            selected={formData.departureTime}
            onChange={(date) => handleDateChange(date, 'departureTime')}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy HH:mm"
            placeholderText="Select departure time"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="arrivalTime">Arrival Time:</label>
          <DatePicker
            selected={formData.arrivalTime}
            onChange={(date) => handleDateChange(date, 'arrivalTime')}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy HH:mm"
            placeholderText="Select arrival time"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="estimatedFlightTime">Estimated Flight Time:</label>
          <input
            type="text"
            id="estimatedFlightTime"
            name="estimatedFlightTime"
            value={formData.estimatedFlightTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="airline">Airline:</label>
          <input
            type="text"
            id="airline"
            name="airline"
            value={formData.airline}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (INR):</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group toggle-group">
          <label>Non-Stop</label>
          <input
            type="checkbox"
            id="nonStop"
            name="nonStop"
            checked={formData.nonStop}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="seatsAvailable">Seats Available:</label>
          <input
            type="number"
            id="seatsAvailable"
            name="seatsAvailable"
            value={formData.seatsAvailable}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Add Flight</button>
      </form>

      <div className="flight-list">
        <h2>Added Flights</h2>
        <table>
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Departure Time</th>
              <th>Arrival Time</th>
              <th>Estimated Flight Time</th>
              <th>Airline</th>
              <th>Price (INR)</th>
              <th>Non-Stop</th>
              <th>Seats Available</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr key={flight._id}>
                <td>{flight.from}</td>
                <td>{flight.to}</td>
                <td>{format(new Date(flight.departureTime), 'dd/MM/yyyy HH:mm')}</td>
                <td>{format(new Date(flight.arrivalTime), 'dd/MM/yyyy HH:mm')}</td>
                <td>{flight.estimatedFlightTime}</td>
                <td>{flight.airline}</td>
                <td>{flight.price} INR</td>
                <td>{flight.nonStop ? 'Yes' : 'No'}</td>
                <td>{flight.seatsAvailable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
