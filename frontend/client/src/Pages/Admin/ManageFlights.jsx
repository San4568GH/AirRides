import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Grid,
  GridItem,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  useToast,
  useColorModeValue,
  Alert,
  AlertIcon,
  NumberInput,
  NumberInputField,
  Checkbox,
  InputGroup,
  InputLeftElement,
  Icon
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ArrowBackIcon, CalendarIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

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

function ManageFlights() {
  const [formData, setFormData] = useState(initialFormData);
  const [flights, setFlights] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, #f5faff, #bbdefb)",
    "linear(to-br, gray.900, gray.800)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.900", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    fetchCities();
    fetchFlights();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch('http://localhost:4000/cities');
      const data = await response.json();
      setCities(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch cities",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchFlights = async () => {
    try {
      const response = await fetch('http://localhost:4000/flights');
      const data = await response.json();
      setFlights(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch flights",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Flight added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setFormData(initialFormData);
        fetchFlights();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to add flight",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add flight",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (!window.confirm('Are you sure you want to delete this flight?')) return;

    try {
      const response = await fetch(`http://localhost:4000/flights/${flightId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Flight deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchFlights();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete flight",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete flight",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box 
      minH="100vh" 
      bgGradient={bgGradient}
      py={8} 
      px={{ base: 4, sm: 6, lg: 8 }}
    >
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <HStack spacing={4} w="full" justify="space-between">
              <Button
                as={Link}
                to="/admin"
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                color={textColor}
              >
                Back to Dashboard
              </Button>
              <Box flex={1} />
            </HStack>
            <Heading 
              as="h1" 
              size="xl" 
              color={textColor}
              bgGradient="linear(to-r, #283593, #1976d2)"
              bgClip="text"
            >
              Manage Flights
            </Heading>
            <Text fontSize="lg" color={mutedTextColor}>
              Add and manage flight schedules
            </Text>
          </VStack>

          {/* Add Flight Form */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg">
            <CardBody p={8}>
              <Heading size="md" color={textColor} mb={6}>
                Add New Flight
              </Heading>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">Flight Number</FormLabel>
                        <Input
                          name="flightNumber"
                          value={formData.flightNumber}
                          onChange={handleChange}
                          placeholder="e.g., AI101"
                          focusBorderColor="#1976d2"
                          _focus={{ 
                            borderColor: "#1976d2",
                            boxShadow: "0 0 0 1px #1976d2"
                          }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">Airline</FormLabel>
                        <Input
                          name="airline"
                          value={formData.airline}
                          onChange={handleChange}
                          placeholder="e.g., Air India"
                          focusBorderColor="#1976d2"
                          _focus={{ 
                            borderColor: "#1976d2",
                            boxShadow: "0 0 0 1px #1976d2"
                          }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">From</FormLabel>
                        <Input
                          name="from"
                          list="from-cities"
                          value={formData.from}
                          onChange={handleChange}
                          placeholder="Select departure city"
                          focusBorderColor="#1976d2"
                          _focus={{ 
                            borderColor: "#1976d2",
                            boxShadow: "0 0 0 1px #1976d2"
                          }}
                        />
                        <datalist id="from-cities">
                          {cities.map((city) => (
                            <option key={city._id} value={city.name} />
                          ))}
                        </datalist>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">To</FormLabel>
                        <Input
                          name="to"
                          list="to-cities"
                          value={formData.to}
                          onChange={handleChange}
                          placeholder="Select destination city"
                          focusBorderColor="#1976d2"
                          _focus={{ 
                            borderColor: "#1976d2",
                            boxShadow: "0 0 0 1px #1976d2"
                          }}
                        />
                        <datalist id="to-cities">
                          {cities.map((city) => (
                            <option key={city._id} value={city.name} />
                          ))}
                        </datalist>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">Departure Time</FormLabel>
                        <DatePicker
                          selected={formData.departureTime}
                          onChange={(date) => handleDateChange(date, 'departureTime')}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="dd/MM/yyyy HH:mm"
                          placeholderText="Select departure time"
                          customInput={
                            <Input
                              focusBorderColor="#1976d2"
                              _focus={{ 
                                borderColor: "#1976d2",
                                boxShadow: "0 0 0 1px #1976d2"
                              }}
                            />
                          }
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">Arrival Time</FormLabel>
                        <DatePicker
                          selected={formData.arrivalTime}
                          onChange={(date) => handleDateChange(date, 'arrivalTime')}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="dd/MM/yyyy HH:mm"
                          placeholderText="Select arrival time"
                          customInput={
                            <Input
                              focusBorderColor="#1976d2"
                              _focus={{ 
                                borderColor: "#1976d2",
                                boxShadow: "0 0 0 1px #1976d2"
                              }}
                            />
                          }
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">Flight Duration</FormLabel>
                        <Input
                          name="estimatedFlightTime"
                          value={formData.estimatedFlightTime}
                          onChange={handleChange}
                          placeholder="e.g., 2h 30m"
                          focusBorderColor="#1976d2"
                          _focus={{ 
                            borderColor: "#1976d2",
                            boxShadow: "0 0 0 1px #1976d2"
                          }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">Price (INR)</FormLabel>
                        <NumberInput
                          value={formData.price}
                          onChange={(valueString) => 
                            setFormData({...formData, price: valueString})
                          }
                          focusBorderColor="#1976d2"
                        >
                          <NumberInputField placeholder="e.g., 5000" />
                        </NumberInput>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">Available Seats</FormLabel>
                        <NumberInput
                          value={formData.seatsAvailable}
                          onChange={(valueString) => 
                            setFormData({...formData, seatsAvailable: valueString})
                          }
                          focusBorderColor="#1976d2"
                        >
                          <NumberInputField placeholder="e.g., 150" />
                        </NumberInput>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <HStack align="center" spacing={3} h="full">
                          <Checkbox
                            name="nonStop"
                            isChecked={formData.nonStop}
                            onChange={handleChange}
                            colorScheme="blue"
                          >
                            <Text color={textColor} fontWeight="medium">Non-Stop Flight</Text>
                          </Checkbox>
                        </HStack>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <Button
                    type="submit"
                    bgGradient="linear(to-r, #283593, #1976d2)"
                    color="white"
                    _hover={{ bgGradient: "linear(to-r, #1976d2, #283593)" }}
                    size="lg"
                    px={8}
                    w="full"
                    shadow="lg"
                    _focus={{ shadow: "xl" }}
                    leftIcon={<AddIcon />}
                    isLoading={loading}
                    loadingText="Adding Flight..."
                  >
                    Add Flight
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Flights List */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg">
            <CardBody p={8}>
              <Heading size="md" color={textColor} mb={6}>
                Flight List ({flights.length})
              </Heading>
              
              {flights.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  No flights found. Add your first flight above.
                </Alert>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr bg={useColorModeValue("gray.50", "gray.700")}>
                        <Th color={mutedTextColor}>Flight</Th>
                        <Th color={mutedTextColor}>Route</Th>
                        <Th color={mutedTextColor}>Departure</Th>
                        <Th color={mutedTextColor}>Arrival</Th>
                        <Th color={mutedTextColor}>Duration</Th>
                        <Th color={mutedTextColor}>Price</Th>
                        <Th color={mutedTextColor}>Seats</Th>
                        <Th color={mutedTextColor}>Type</Th>
                        <Th color={mutedTextColor}>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {flights.map((flight) => (
                        <Tr key={flight._id} _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium" color={textColor} fontSize="sm">
                                {flight.flightNumber}
                              </Text>
                              <Text fontSize="xs" color={mutedTextColor}>
                                {flight.airline}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={textColor}>
                              {flight.from} → {flight.to}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={textColor}>
                              {format(new Date(flight.departureTime), 'dd/MM/yyyy HH:mm')}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={textColor}>
                              {format(new Date(flight.arrivalTime), 'dd/MM/yyyy HH:mm')}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={textColor}>
                              {flight.estimatedFlightTime}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>
                              ₹{flight.price}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={textColor}>
                              {flight.seatsAvailable}
                            </Text>
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme={flight.nonStop ? 'green' : 'yellow'}
                              fontSize="xs"
                            >
                              {flight.nonStop ? 'Non-Stop' : 'Connecting'}
                            </Badge>
                          </Td>
                          <Td>
                            <IconButton
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFlight(flight._id)}
                              aria-label="Delete flight"
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}

export default ManageFlights;
