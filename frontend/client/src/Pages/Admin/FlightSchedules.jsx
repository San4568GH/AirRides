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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  useToast,
  useColorModeValue,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Select,
  Input,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function FlightSchedules() {
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [newDepartureTime, setNewDepartureTime] = useState(null);
  const [newArrivalTime, setNewArrivalTime] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    fetchFlights();
  }, []);

  useEffect(() => {
    filterFlights();
  }, [flights, searchTerm, dateFilter]);

  const fetchFlights = async () => {
    try {
      const response = await fetch('http://localhost:4000/flights');
      if (response.ok) {
        const data = await response.json();
        setFlights(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch flights",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch flights",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFlights = () => {
    let filtered = [...flights];

    if (searchTerm) {
      filtered = filtered.filter(flight => 
        flight.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.airline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.to?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const now = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter(flight => {
        const departureDate = new Date(flight.departureTime);
        switch (dateFilter) {
          case 'today':
            return departureDate.toDateString() === now.toDateString();
          case 'week':
            return departureDate <= addWeeks(now, 1) && departureDate >= now;
          case 'month':
            return departureDate <= addMonths(now, 1) && departureDate >= now;
          default:
            return true;
        }
      });
    }

    // Sort by departure time
    filtered.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    setFilteredFlights(filtered);
  };

  const handleEditSchedule = (flight) => {
    setSelectedFlight(flight);
    setNewDepartureTime(new Date(flight.departureTime));
    setNewArrivalTime(new Date(flight.arrivalTime));
    onOpen();
  };

  const handleUpdateSchedule = async () => {
    if (!selectedFlight || !newDepartureTime || !newArrivalTime) return;

    try {
      const response = await fetch(`http://localhost:4000/flights/${selectedFlight._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departureTime: newDepartureTime,
          arrivalTime: newArrivalTime,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Flight schedule updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchFlights();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update schedule",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update schedule",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getFlightStatus = (departureTime) => {
    const now = new Date();
    const departure = new Date(departureTime);
    const hoursDiff = (departure - now) / (1000 * 60 * 60);

    if (hoursDiff < 0) return { status: 'departed', color: 'gray' };
    if (hoursDiff < 2) return { status: 'boarding', color: 'orange' };
    if (hoursDiff < 24) return { status: 'today', color: 'blue' };
    return { status: 'scheduled', color: 'green' };
  };

  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} py={8} px={{ base: 4, sm: 6, lg: 8 }}>
        <Container maxW="6xl">
          <VStack spacing={8}>
            <Text color={textColor}>Loading flight schedules...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

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
              Flight Schedules
            </Heading>
            <Text fontSize="lg" color={mutedTextColor}>
              Manage flight schedules and timing
            </Text>
          </VStack>

          {/* Filters */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg">
            <CardBody p={6}>
              <VStack spacing={4}>
                <Heading size="md" color={textColor}>
                  Filter Schedules
                </Heading>
                <HStack spacing={4} w="full">
                  <Input
                    placeholder="Search by flight number, airline, or route"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    focusBorderColor="#1976d2"
                    _focus={{ 
                      borderColor: "#1976d2",
                      boxShadow: "0 0 0 1px #1976d2"
                    }}
                  />
                  <Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    maxW="200px"
                    focusBorderColor="#1976d2"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </Select>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Flight Schedules Table */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg">
            <CardBody p={8}>
              <Heading size="md" color={textColor} mb={6}>
                Flight Schedules ({filteredFlights.length})
              </Heading>
              
              {filteredFlights.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  No flights found matching your criteria.
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
                        <Th color={mutedTextColor}>Status</Th>
                        <Th color={mutedTextColor}>Seats Available</Th>
                        <Th color={mutedTextColor}>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredFlights.map((flight) => {
                        const flightStatus = getFlightStatus(flight.departureTime);
                        return (
                          <Tr key={flight._id} _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" fontWeight="medium" color={textColor}>
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
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" color={textColor}>
                                  {format(new Date(flight.departureTime), 'dd/MM/yyyy')}
                                </Text>
                                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                  {format(new Date(flight.departureTime), 'HH:mm')}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" color={textColor}>
                                  {format(new Date(flight.arrivalTime), 'dd/MM/yyyy')}
                                </Text>
                                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                  {format(new Date(flight.arrivalTime), 'HH:mm')}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color={textColor}>
                                {flight.estimatedFlightTime}
                              </Text>
                            </Td>
                            <Td>
                              <Badge 
                                colorScheme={flightStatus.color}
                                fontSize="xs"
                              >
                                {flightStatus.status}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color={textColor}>
                                {flight.seatsAvailable}
                              </Text>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <IconButton
                                  icon={<EditIcon />}
                                  colorScheme="blue"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSchedule(flight)}
                                  aria-label="Edit schedule"
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Edit Schedule Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader 
            bgGradient="linear(to-r, #283593, #1976d2)" 
            color="white" 
            borderTopRadius="md"
          >
            Edit Flight Schedule
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={6}>
            {selectedFlight && (
              <VStack spacing={4} align="stretch">
                <Text color={textColor} fontSize="lg" fontWeight="medium">
                  {selectedFlight.flightNumber} - {selectedFlight.from} → {selectedFlight.to}
                </Text>
                
                <FormControl>
                  <FormLabel color={textColor}>Departure Time</FormLabel>
                  <DatePicker
                    selected={newDepartureTime}
                    onChange={(date) => setNewDepartureTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
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
                
                <FormControl>
                  <FormLabel color={textColor}>Arrival Time</FormLabel>
                  <DatePicker
                    selected={newArrivalTime}
                    onChange={(date) => setNewArrivalTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
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
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                bgGradient="linear(to-r, #283593, #1976d2)"
                color="white"
                _hover={{ bgGradient: "linear(to-r, #1976d2, #283593)" }}
                onClick={handleUpdateSchedule}
              >
                Update Schedule
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default FlightSchedules;
