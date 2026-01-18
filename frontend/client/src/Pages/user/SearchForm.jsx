import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { generateUniqueBookingId } from "../../utils/bookingUtils";
import { Box, Container, Heading, VStack, HStack, FormControl, FormLabel, Input, Select, Button, Card, CardBody, Text, Badge, Divider, Grid, GridItem, Switch, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Icon, Flex, useColorModeValue, InputGroup, InputLeftElement, Stack } from '@chakra-ui/react';
import { SearchIcon, CalendarIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  // Color mode values for better theming
  const bgGradient = useColorModeValue(
    "linear(to-br, #f5faff, #bbdefb)",
    "linear(to-br, gray.900, gray.800)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.900", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");

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

    const fetchRazorpayKey = async () => {
      try {
        const response = await fetch('http://localhost:4000/razorpay-key');
        const data = await response.json();
        setRazorpayKeyId(data.key_id);
      } catch (error) {
        console.error('Error fetching Razorpay key:', error);
        setError('Failed to load payment configuration');
      }
    };

    fetchCities();
    fetchRazorpayKey();
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
      alert('Please Login to book your flight');
      navigate('/login');
      return;
    }
    
    if (!razorpayKeyId) {
      alert('Payment system is loading. Please wait a moment and try again.');
      return;
    }
    
    setSelectedFlight(flight);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedFlight(null);
    onClose();
  };

  const loadRazorpayScript = (src) => {
    // return new Promise((resolve) => {
    //   const script = document.createElement('script');
    //   script.src = src;
    //   script.onload = () => resolve(true);
    //   script.onerror = () => resolve(false);
    //   document.body.appendChild(script);
     return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      // Already loaded
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
    });
  };

  // const handleConfirmBooking = async () => {
  //   const totalPrice = selectedFlight.price * formData.passengers;

  //   // Create order on the backend
  //   const response = await fetch('http://localhost:4000/create-order', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ amount: totalPrice }), // Amount in rupees
  //   });

  //   const data = await response.json();

  //   if (!response.ok) {
  //     return alert('Failed to create order');
  //   }

  //   const options = {
  //     key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with your Razorpay key ID
  //     amount: data.amount,
  //     currency: 'INR',
  //     name: 'AirRides',
  //     description: 'Flight Booking',
  //     order_id: data.id,
  //     handler: function (response) {
  //       alert(`Payment successful: ${response.razorpay_payment_id}`);
  //       // Handle payment success, save the booking in the database
  //       verifyPayment(response);
  //     },
  //     prefill: {
  //       name: userInfo.name,
  //       email: userInfo.email,
  //       contact: userInfo.contact,
  //     },
  //     notes: {
  //       address: 'Booking address',
  //     },
  //     theme: {
  //       color: '#3399cc',
  //     },
  //   };

  //   const scriptLoaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

  //   if (!scriptLoaded) {
  //     return alert('Failed to load Razorpay script');
  //   }

  //   const rzp1 = new window.Razorpay(options);
  //   rzp1.open();
  // };

  // const verifyPayment = async (response) => {
  //   try {
  //     const verifyResponse = await fetch('http://localhost:4000/verify-payment', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         razorpay_order_id: response.razorpay_order_id,
  //         razorpay_payment_id: response.razorpay_payment_id,
  //         razorpay_signature: response.razorpay_signature,
  //         flightId: selectedFlight._id,
  //         passengers: formData.passengers,
  //         userId: userInfo._id, 
  //       }),
  //     });
  
  //     if (!verifyResponse.ok) {
  //       throw new Error('Payment verification failed');
  //     }
  
  //     const result = await verifyResponse.json();
  //     alert('Payment verified successfully');
  //     // Update user context with new booking
  //     setUserInfo((prevInfo) => ({
  //       ...prevInfo,
  //       bookedFlights: [...prevInfo.bookedFlights, {
  //         flightId: selectedFlight._id,
  //         flightNumber: selectedFlight.flightNumber,
  //         from: selectedFlight.from,
  //         to: selectedFlight.to,
  //         departureTime: selectedFlight.departureTime,
  //         arrivalTime: selectedFlight.arrivalTime,
  //         airline: selectedFlight.airline,
  //         price: selectedFlight.price,
  //         nonStop: selectedFlight.nonStop,
  //         bookingDate: new Date(),
  //         passengers: formData.passengers,
  //       }],
  //     }));
  //   } catch (error) {
  //     console.error('Payment verification error:', error);
  //     alert('Payment verification failed');
  //   }
  // };
   const handleConfirmBooking = async () => {
    try {
      // Check if Razorpay key is loaded
      if (!razorpayKeyId) {
        alert("Payment system not ready. Please try again.");
        return;
      }

      const totalPrice = selectedFlight.price * formData.passengers;

      // 1. Create order on backend
      const response = await fetch("http://localhost:4000/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }), // rupees (backend will convert)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to create order: ${errorData.description || errorData.error}`);
        return;
      }

      const data = await response.json();
      console.log('Order created:', data);

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK");
        return;
      }

      // 3. Open Razorpay checkout with correct key
      const options = {
        key: razorpayKeyId, // 🔑 Use dynamically fetched key
        amount: data.amount, // already in paise (from backend)
        currency: "INR",
        name: "AirRides",
        description: `Flight Booking: ${selectedFlight.from} to ${selectedFlight.to}`,
        order_id: data.id,
        handler: function (response) {
          // 4. On success → verify payment with backend
          console.log('Payment response:', response);
          verifyPayment(response);
        },
        prefill: {
          name: userInfo?.name || userInfo?.username || "",
          email: userInfo?.email || "",
          contact: userInfo?.phone || "",
        },
        notes: {
          flight_id: selectedFlight._id,
          passengers: formData.passengers,
          route: `${selectedFlight.from} to ${selectedFlight.to}`
        },
        theme: {
          color: "#283593",
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed by user');
          }
        }
      };

      console.log('Opening Razorpay with options:', { ...options, key: razorpayKeyId.slice(0, 10) + '...' });
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
      });
      
      rzp1.open();
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const verifyPayment = async (response) => {
    try {
      console.log('Verifying payment:', response);
      
      const verifyResponse = await fetch("http://localhost:4000/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          flightId: selectedFlight._id,
          passengers: formData.passengers,
          userId: userInfo._id || userInfo.id,
        }),
      });

      const result = await verifyResponse.json();
      
      if (!verifyResponse.ok) {
        throw new Error(result.description || result.error || "Payment verification failed");
      }

      console.log('Payment verified successfully:', result);
      
      // Generate booking ID first
      const generateBookingId = () => {
        return generateUniqueBookingId();
      };

      const bookingId = generateBookingId();
      
      alert(`🎉 Payment verified successfully!\nBooking ID: ${bookingId}\nFlight: ${selectedFlight.from} to ${selectedFlight.to}`);

      // 5. Update user context with booking

      const newBooking = {
        bookingId: bookingId,
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
        paymentId: response.razorpay_payment_id
      };

      setUserInfo((prevInfo) => ({
        ...prevInfo,
        bookedFlights: [
          ...(prevInfo.bookedFlights || []),
          newBooking
        ],
      }));

      // Close the modal after successful booking
      handleCloseModal();
      
      // Optionally redirect to dashboard
      // navigate('/dashboard');
      
    } catch (error) {
      console.error("Payment verification error:", error);
      alert(`❌ Payment verification failed: ${error.message}`);
    }
  };

  const roundTrip = formData?.roundTrip;

  return (
    <Box 
      minH="100vh" 
      bgGradient={bgGradient}
      py={6} 
      px={{ base: 4, sm: 6, lg: 8 }}
    >
      <Container maxW="50%">
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} textAlign="center" py={2}>
            <Heading 
              as="h1" 
              size="xl" 
              color={textColor}
              bgGradient="linear(to-r, #283593, #1976d2)"
              bgClip="text"
              lineHeight="1.2"
              pb={1}
            >
              Search Flights
            </Heading>
            <Text color={mutedTextColor} fontSize="md">
              Find the perfect flight for your journey
            </Text>
          </VStack>

          {/* Search Form */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg" w="full" mx="auto">
            <CardBody p={4}>
              <form onSubmit={handleSubmit}>
                  <VStack spacing={4} align="center" w="full">
                    {/* Round Trip Toggle */}
                    <FormControl maxW="350px">
                      <HStack justify="center" spacing={3}>
                        <Text color={textColor} fontWeight="medium" fontSize="sm">One-Way</Text>
                        <Switch
                          isChecked={formData.roundTrip}
                          onChange={handleToggle}
                          colorScheme="blue"
                          size="md"
                        />
                        <Text color={textColor} fontWeight="medium" fontSize="sm">Round-Trip</Text>
                      </HStack>
                    </FormControl>

                    {/* From */}
                    <FormControl isRequired maxW="350px">
                      <FormLabel color={textColor} fontWeight="medium" textAlign="center" fontSize="sm" mb={1}>From</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={SearchIcon} color={mutedTextColor} />
                        </InputLeftElement>
                        <Input
                          name="from"
                          placeholder="Departure city"
                          value={formData.from}
                          onChange={handleChange}
                          list="from-cities"
                          focusBorderColor="#1976d2"
                          _focus={{ 
                            borderColor: "#1976d2",
                            boxShadow: "0 0 0 1px #1976d2"
                          }}
                          size="md"
                          pl="2.5rem"
                          textAlign="center"
                        />
                      </InputGroup>
                      <datalist id="from-cities">
                        {cities.map((city) => (
                          <option key={city._id} value={city.name} />
                        ))}
                      </datalist>
                    </FormControl>

                    {/* To */}
                    <FormControl isRequired maxW="350px">
                      <FormLabel color={textColor} fontWeight="medium" textAlign="center" fontSize="sm" mb={1}>To</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={ArrowForwardIcon} color={mutedTextColor} />
                        </InputLeftElement>
                        <Input
                          name="to"
                          placeholder="Destination city"
                          value={formData.to}
                          onChange={handleChange}
                          list="to-cities"
                          focusBorderColor="#1976d2"
                          _focus={{ 
                            borderColor: "#1976d2",
                            boxShadow: "0 0 0 1px #1976d2"
                          }}
                          size="md"
                          pl="2.5rem"
                          textAlign="center"
                        />
                      </InputGroup>
                      <datalist id="to-cities">
                        {cities.map((city) => (
                          <option key={city._id} value={city.name} />
                        ))}
                      </datalist>
                    </FormControl>

                    {/* Departure Date */}
                    <FormControl isRequired maxW="350px">
                      <FormLabel color={textColor} fontWeight="medium" textAlign="center" fontSize="sm" mb={1}>Departure Date</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={CalendarIcon} color={mutedTextColor} />
                        </InputLeftElement>
                        <Box position="relative" w="full">
                          <DatePicker
                            selected={formData.departureDate}
                            onChange={(date) => handleDateChange(date, 'departureDate')}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select date"
                            customInput={
                              <Input
                                size="md"
                                pl="2.5rem"
                                pr="0.75rem"
                                focusBorderColor="#1976d2"
                                _focus={{ 
                                  borderColor: "#1976d2",
                                  boxShadow: "0 0 0 1px #1976d2"
                                }}
                                textAlign="center"
                                w="full"
                              />
                            }
                            popperProps={{
                              positionFixed: true
                            }}
                          />
                        </Box>
                      </InputGroup>
                    </FormControl>

                    {/* Return Date (if round trip) */}
                    {roundTrip && (
                      <FormControl isRequired={roundTrip} maxW="350px">
                        <FormLabel color={textColor} fontWeight="medium" textAlign="center" fontSize="sm" mb={1}>Return Date</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={CalendarIcon} color={mutedTextColor} />
                          </InputLeftElement>
                          <Box position="relative" w="full">
                            <DatePicker
                              selected={formData.returnDate}
                              onChange={(date) => handleDateChange(date, 'returnDate')}
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Select date"
                              customInput={
                                <Input
                                  size="md"
                                  pl="2.5rem"
                                  pr="0.75rem"
                                  focusBorderColor="#1976d2"
                                  _focus={{ 
                                    borderColor: "#1976d2",
                                    boxShadow: "0 0 0 1px #1976d2"
                                  }}
                                  textAlign="center"
                                  w="full"
                                />
                              }
                              popperProps={{
                                positionFixed: true
                              }}
                            />
                          </Box>
                        </InputGroup>
                      </FormControl>
                    )}

                    {/* Passengers */}
                    <FormControl isRequired maxW="350px">
                      <FormLabel color={textColor} fontWeight="medium" textAlign="center" fontSize="sm" mb={1}>Passengers</FormLabel>
                      <NumberInput
                        min={1}
                        max={10}
                        value={formData.passengers}
                        onChange={(valueString) => 
                          setFormData({...formData, passengers: parseInt(valueString) || 1})
                        }
                        size="md"
                        focusBorderColor="#1976d2"
                      >
                        <NumberInputField textAlign="center" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <Button
                      type="submit"
                      bgGradient="linear(to-r, #283593, #1976d2)"
                      color="white"
                      _hover={{ bgGradient: "linear(to-r, #1976d2, #283593)" }}
                      size="md"
                      px={6}
                      leftIcon={<SearchIcon />}
                      shadow="lg"
                      _focus={{ shadow: "xl" }}
                      maxW="350px"
                      w="full"
                      mt={2}
                    >
                      Search Flights
                    </Button>
                  </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Error Message */}
          {error && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Flight Results */}
          <Box>
            {flights.length === 0 ? (
              <VStack spacing={4} py={12} textAlign="center">
                <Icon viewBox="0 0 24 24" w={16} h={16} color={mutedTextColor}>
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </Icon>
                <Heading size="lg" color={mutedTextColor}>
                  No Flights Found
                </Heading>
                <Text color={mutedTextColor}>
                  Try adjusting your search criteria
                </Text>
              </VStack>
            ) : (
              <VStack spacing={3}>
                <Heading size="md" color={textColor} textAlign="center">
                  Available Flights ({flights.length})
                </Heading>
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4} w="full">
                  {flights.map((flight) => (
                    <Card 
                      key={flight._id} 
                      bg={cardBg} 
                      shadow="md" 
                      _hover={{ shadow: "lg", transform: "translateY(-1px)" }}
                      transition="all 0.3s"
                      borderRadius="lg"
                      overflow="hidden"
                      border="1px solid"
                      borderColor={useColorModeValue("gray.200", "gray.600")}
                      size="sm"
                    >
                      {/* Flight Header */}
                      <Box bgGradient="linear(to-r, #283593, #1976d2)" p={3}>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="md" fontWeight="bold" color="white">
                              {flight.airline}
                            </Text>
                            <Text fontSize="xs" color="whiteAlpha.800">
                              {flight.flightNumber}
                            </Text>
                          </VStack>
                          <Badge
                            bg="whiteAlpha.200"
                            color="white"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                          >
                            {flight.nonStop ? 'Non-Stop' : 'Connecting'}
                          </Badge>
                        </HStack>
                      </Box>

                      <CardBody p={4}>
                        {/* Route Information */}
                        <HStack justify="space-between" align="center" mb={3}>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="bold" color={textColor}>
                              {flight.from}
                            </Text>
                            <Text fontSize="xs" color={mutedTextColor}>
                              {new Date(flight.departureTime).toLocaleDateString()}
                            </Text>
                            <Text fontSize="xs" color={mutedTextColor}>
                              {new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </Text>
                          </VStack>

                          <VStack spacing={0}>
                            <Icon viewBox="0 0 24 24" w={6} h={6} color="#283593">
                              <path
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                              />
                            </Icon>
                            <Text fontSize="2xs" color={mutedTextColor} textAlign="center">
                              {flight.estimatedFlightTime || 'Direct'}
                            </Text>
                          </VStack>

                          <VStack align="end" spacing={0}>
                            <Text fontSize="lg" fontWeight="bold" color={textColor}>
                              {flight.to}
                            </Text>
                            <Text fontSize="xs" color={mutedTextColor}>
                              {new Date(flight.arrivalTime).toLocaleDateString()}
                            </Text>
                            <Text fontSize="xs" color={mutedTextColor}>
                              {new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </Text>
                          </VStack>
                        </HStack>

                        <Divider mb={3} />

                        {/* Flight Details */}
                        <VStack spacing={1} align="stretch" mb={3}>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color={mutedTextColor}>Price per person:</Text>
                            <Text fontSize="sm" fontWeight="bold" color="#283593">
                              ₹{flight.price}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color={mutedTextColor}>Seats Available:</Text>
                            <Badge colorScheme={flight.seatsAvailable > 10 ? 'green' : 'orange'} fontSize="2xs">
                              {flight.seatsAvailable} seats
                            </Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color={mutedTextColor}>Total Price:</Text>
                            <Text fontSize="md" fontWeight="bold" color="#283593">
                              ₹{flight.price * formData.passengers}
                            </Text>
                          </HStack>
                        </VStack>

                        <Button
                          w="full"
                          bgGradient="linear(to-r, #283593, #1976d2)"
                          color="white"
                          _hover={{ bgGradient: "linear(to-r, #1976d2, #283593)" }}
                          onClick={() => handleBookNow(flight)}
                          size="sm"
                          shadow="sm"
                          _focus={{ shadow: "md" }}
                        >
                          Book Now
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </Grid>
              </VStack>
            )}
          </Box>
        </VStack>
      </Container>

      {/* Booking Confirmation Modal */}
      {selectedFlight && (
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
          <ModalOverlay />
          <ModalContent bg={cardBg}>
            <ModalHeader 
              bgGradient="linear(to-r, #283593, #1976d2)" 
              color="white" 
              borderTopRadius="md"
            >
              Confirm Flight Booking
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody p={6}>
              <VStack spacing={4} align="stretch">
                <Card bg={useColorModeValue("gray.50", "gray.700")}>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="medium" color={textColor}>Airline:</Text>
                        <Text color={textColor}>{selectedFlight.airline}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" color={textColor}>Flight Number:</Text>
                        <Text color={textColor}>{selectedFlight.flightNumber}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" color={textColor}>Route:</Text>
                        <Text color={textColor}>{selectedFlight.from} → {selectedFlight.to}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" color={textColor}>Departure:</Text>
                        <Text color={textColor}>{new Date(selectedFlight.departureTime).toLocaleString()}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" color={textColor}>Arrival:</Text>
                        <Text color={textColor}>{new Date(selectedFlight.arrivalTime).toLocaleString()}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" color={textColor}>Price per person:</Text>
                        <Text color={textColor}>₹{selectedFlight.price}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium" color={textColor}>Passengers:</Text>
                        <Text color={textColor}>{formData.passengers}</Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="bold" color={textColor}>Total Amount:</Text>
                        <Text fontSize="lg" fontWeight="bold" color="#283593">
                          ₹{selectedFlight.price * formData.passengers}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  bgGradient="linear(to-r, #283593, #1976d2)"
                  color="white"
                  _hover={{ bgGradient: "linear(to-r, #1976d2, #283593)" }}
                  onClick={handleConfirmBooking}
                >
                  Confirm Booking
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
