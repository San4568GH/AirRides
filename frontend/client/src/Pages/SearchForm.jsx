import React, { useState, useEffect,useContext } from 'react';
import '../App.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import { UserContext } from '../UserContext';
import { useNavigate} from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root'); 



export default function SearchForm() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureDate: null,
    returnDate: null,
    passengers: 1,
    roundTrip: false,
  });

  const [cities, setCities] = useState([]);
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState('');
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const navigate=useNavigate();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('http://localhost:4000/cities');
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleToggle = () => {
    setFormData((prevData) => ({
      ...prevData,
      roundTrip: !prevData.roundTrip,
      returnDate: !prevData.roundTrip ? prevData.returnDate : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:4000/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch flights');
        return;
      }

      const data = await response.json();
      if (data.length === 0) {
        setError('No flights found');
      } else {
        setFlights(data);
      }
    } catch (error) {
      setError('Failed to fetch flights');
    }
  };

  const handleBookNow = (flight) => {
    if (!userInfo || !userInfo.username) {
      alert('Please Login to book your flight')
      navigate('/login');
    } else {
      setSelectedFlight(flight);

    }
  };

  const handleCloseModal = () => {
    setSelectedFlight(null);
  };

  const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConfirmBooking = async () => {
    const totalPrice = selectedFlight.price * formData.passengers;

    // Create order on the backend
    const response = await fetch('http://localhost:4000/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: totalPrice }), // Amount in rupees
    });

    const data = await response.json();

    if (!response.ok) {
      return alert('Failed to create order');
    }

    const options = {
      key: import.meta.env.RAZORPAY_KEY_ID, // Replace with your Razorpay key ID
      amount: data.amount,
      currency: 'INR',
      name: 'AirRides',
      description: 'Flight Booking',
      order_id: data.id,
      handler: function (response) {
        alert(`Payment successful: ${response.razorpay_payment_id}`);
        // Handle payment success, save the booking in the database
        verifyPayment(response);
      },
      prefill: {
        name: userInfo.name,
        email: userInfo.email,
        contact: userInfo.contact,
      },
      notes: {
        address: 'Booking address',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const scriptLoaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!scriptLoaded) {
      return alert('Failed to load Razorpay script');
    }

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const verifyPayment = async (response) => {
    try {
      const verifyResponse = await fetch('http://localhost:4000/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          flightId: selectedFlight._id,
          passengers: formData.passengers,
          userId: userInfo._id, 
        }),
      });
  
      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }
  
      const result = await verifyResponse.json();
      alert('Payment verified successfully');
      // Update user context with new booking
      setUserInfo((prevInfo) => ({
        ...prevInfo,
        bookedFlights: [...prevInfo.bookedFlights, {
          flightId: selectedFlight._id,
          flightNumber: selectedFlight.flightNumber,
          from: selectedFlight.from,
          to: selectedFlight.to,
          departureTime: selectedFlight.departureTime,
          arrivalTime: selectedFlight.arrivalTime,
          airline: selectedFlight.airline,
          price: selectedFlight.price,
          nonStop: selectedFlight.nonStop,
          bookingDate: new Date(),
          passengers: formData.passengers,
        }],
      }));
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed');
    }
  };

  const roundTrip = formData?.roundTrip;

  return (
    <div className="Search">
      <h1>Search Flights</h1>
      <form onSubmit={handleSubmit} className="flight-form">
        <div className="form-group toggle-group">
          <label>One-Way</label>
          <Toggle
            defaultChecked={formData.roundTrip}
            icons={false}
            onChange={handleToggle}
          />
          <label>Round-Trip</label>
        </div>

        <div className="form-group">
          <label htmlFor="from">From:</label>
          <input
            type="text"
            id="from"
            name="from"
            list="from-cities"
            placeholder="From"
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
            placeholder="To"
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
          <label htmlFor="departureDate">Start Date:</label>
          <DatePicker
            selected={formData.departureDate}
            onChange={(date) => handleDateChange(date, 'departureDate')}
            dateFormat="dd/MM/yyyy"
            placeholderText="Start Date"
            required
          />
        </div>

        {roundTrip && (
          <div className="form-group">
            <label htmlFor="returnDate">Return Date:</label>
            <DatePicker
              selected={formData.returnDate}
              onChange={(date) => handleDateChange(date, 'returnDate')}
              dateFormat="dd/MM/yyyy"
              placeholderText="Return Date"
              required={roundTrip}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="passengers">Passengers:</label>
          <input
            type="number"
            id="passengers"
            name="passengers"
            min="1"
            value={formData.passengers}
            onChange={handleChange}
            required
          />
        </div>
        <button className="searchsub" type="submit">
          Search
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="flight-results">
        {flights.length === 0 ? (
          <div>No Flights Found</div>
        ) : (
          flights.map((flight) => (
            <div key={flight._id} className="flight-card">
              <div><b> {flight.airline}</b></div>

              <div><u>Flight Number</u>: {flight.flightNumber}</div>
              <div><u>From </u>:{flight.from}</div>
              <div><u>To</u>: {flight.to}</div>
              <div><u>Departure</u>: {new Date(flight.departureTime).toLocaleString()}</div>
              <div><u>Arrival</u>:{new Date(flight.arrivalTime).toLocaleString()}</div>
              <div><u>Price(Per PaX)</u> : {flight.price} INR</div>
              <div><u>Non-Stop</u>: {flight.nonStop ? 'Yes' : 'No'}</div>
              <div><u>Seats Available</u>: {flight.seatsAvailable}</div>
              <button className="book-now" onClick={() => handleBookNow(flight)}>
                Book Now
              </button>
            </div>
          ))
        )}
      </div>
    


{selectedFlight && (
  <Modal
    isOpen={!!selectedFlight}
    onRequestClose={handleCloseModal}
    contentLabel="Confirm Booking"
    className="modal"
    overlayClassName="overlay"
  >
    <h2>Flight Details</h2>
    <div>Airline: {selectedFlight.airline}</div>
    <div>Flight Number: {selectedFlight.flightNumber}</div>
    <div>From: {selectedFlight.from}</div>
    <div>To: {selectedFlight.to}</div>
    <div>Departure: {new Date(selectedFlight.departureTime).toLocaleString()}</div>
    <div>Arrival: {new Date(selectedFlight.arrivalTime).toLocaleString()}</div>
    <div>Price: {selectedFlight.price} {selectedFlight.currency}</div>
    <div>Non-Stop: {selectedFlight.nonStop ? 'Yes' : 'No'}</div>
    <div>Seats Available: {selectedFlight.seatsAvailable}</div>
    <div>Total Price: {selectedFlight.price * formData.passengers} INR</div>
    <button className="confirm-booking" onClick={handleConfirmBooking}>
      Confirm Booking
    </button>
    <button className="close-modal" onClick={handleCloseModal}>
      Close
    </button>
  </Modal>
)}
</div>


  );
}
