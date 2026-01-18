import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Heading, Text, Grid, Card, CardBody, VStack, HStack, Badge, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, useToast, Divider, Flex, Icon, Alert, AlertIcon } from "@chakra-ui/react";
import { ArrowForwardIcon, SearchIcon, DownloadIcon, SettingsIcon } from "@chakra-ui/icons";
import { UserContext } from "../../context/UserContext";
import { formatBookingReference, getFlightStatus } from "../../utils/bookingUtils";

export default function Dashboard() {
    const { userInfo, setUserInfo } = useContext(UserContext);
    const [bookedFlights, setBookedFlights] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // Manual refresh function
    const handleRefreshBookings = async () => {
      setIsRefreshing(true);
      try {        
        // Clear localStorage to force fresh data
        localStorage.removeItem('userInfo');
        
        const response = await fetch('http://localhost:4000/profile', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const profileData = await response.json();
          setUserInfo(profileData);
          
          toast({
            title: "Bookings Refreshed!",
            description: "Latest booking data has been loaded.",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error refreshing bookings:', error);
        toast({
          title: "Refresh Failed",
          description: "Could not refresh booking data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsRefreshing(false);
      }
    };
  
    useEffect(() => {
      if (userInfo && userInfo.bookedFlights) {
        setBookedFlights(userInfo.bookedFlights);
      }
    }, [userInfo]);

    // Download ticket functionality
    const handleDownloadTicket = async (flight) => {
      setIsDownloading(true);
      try {
        // Simulate PDF generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create a simple text-based ticket (in real app, this would be a PDF)
        const ticketContent = `
AirRides E-Ticket
=====================================
${flight.bookingId ? `Booking ID: ${flight.bookingId}` : ''}
Flight: ${flight.airline} ${flight.flightNumber}
From: ${flight.from} → To: ${flight.to}
Departure: ${new Date(flight.departureTime).toLocaleString()}
Arrival: ${new Date(flight.arrivalTime).toLocaleString()}
Passengers: ${flight.passengers}
Total Paid: ₹${flight.price * flight.passengers}
Booking Date: ${new Date(flight.bookingDate).toLocaleDateString()}
${flight.paymentId ? `Payment ID: ${flight.paymentId}` : ''}
=====================================
Thank you for choosing AirRides!
Keep this ticket for your records.
        `;
        
        // Create downloadable file
        const blob = new Blob([ticketContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AirRides_Ticket_${flight.flightNumber}_${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Ticket Downloaded!",
          description: "Your e-ticket has been downloaded successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Download Failed",
          description: "There was an error downloading your ticket. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsDownloading(false);
      }
    };

    // Manage booking functionality
    const handleManageBooking = (flight) => {
      setSelectedFlight(flight);
      onOpen();
    };
  
    return (
      <Box 
        minH="100vh" 
        bgGradient="linear(to-br, #f5faff, #bbdefb)" 
        py={12} 
        px={{ base: 4, sm: 6, lg: 8 }}
      >
        <Container maxW="6xl">
          <VStack spacing={8} align="stretch">
            <VStack spacing={2} textAlign="center">
              <Heading as="h1" size="2xl" color="gray.900">
                My Flight Bookings
              </Heading>
              <Text color="gray.600">
                View and manage your flight reservations
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={handleRefreshBookings}
                isLoading={isRefreshing}
                loadingText="Refreshing..."
                mt={2}
              >
                🔄 Refresh Bookings
              </Button>
            </VStack>
            
            {bookedFlights.length > 0 ? (
              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                {bookedFlights.map((flight, index) => (
                  <Card 
                    key={index} 
                    bg="white" 
                    shadow="xl" 
                    _hover={{ shadow: "2xl" }}
                    transition="all 0.3s"
                    overflow="hidden"
                  >
                    <Box bgGradient="linear(to-r, #283593, #1976d2)" px={6} py={4}>
                      <Flex justify="space-between" align="center" wrap="wrap">
                        <VStack align="start" spacing={1}>
                          <Heading as="h3" size="lg" color="white">
                            {flight.airline}
                          </Heading>
                          {flight.bookingId && (
                            <Text fontSize="xs" color="whiteAlpha.800">
                              Booking ID: {formatBookingReference(flight.bookingId)}
                            </Text>
                          )}
                        </VStack>
                        <VStack align="end" spacing={1}>
                          <Badge
                            bg="whiteAlpha.200"
                            color="white"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="sm"
                          >
                            {flight.flightNumber}
                          </Badge>
                          {flight.departureTime && (
                            <Text fontSize="xs" color="whiteAlpha.800">
                              {getFlightStatus(flight.departureTime).emoji} {getFlightStatus(flight.departureTime).status}
                            </Text>
                          )}
                        </VStack>
                      </Flex>
                    </Box>
                    
                    <CardBody p={6}>
                      <Flex justify="space-between" align="center" mb={6}>
                        <VStack spacing={1} textAlign="center">
                          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                            {flight.from}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {new Date(flight.departureTime).toLocaleDateString()}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </Text>
                        </VStack>
                        
                        <VStack spacing={1} flex="1" mx={6}>
                          <Icon as={ArrowForwardIcon} w={8} h={8} color="#283593" />
                          <Text fontSize="xs" color="gray.500" textAlign="center">
                            Direct Flight
                          </Text>
                        </VStack>
                        
                        <VStack spacing={1} textAlign="center">
                          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                            {flight.to}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {new Date(flight.arrivalTime).toLocaleDateString()}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </Text>
                        </VStack>
                      </Flex>
                      
                      <Box borderTop="1px" borderColor="gray.200" pt={4}>
                        <VStack spacing={3}>
                          <Flex justify="space-between" w="full">
                            <Text fontSize="sm" color="gray.600">Passengers:</Text>
                            <Text fontSize="sm" fontWeight="medium">{flight.passengers}</Text>
                          </Flex>
                          <Flex justify="space-between" w="full">
                            <Text fontSize="sm" color="gray.600">Price per person:</Text>
                            <Text fontSize="sm" fontWeight="medium">₹{flight.price}</Text>
                          </Flex>
                          <Flex justify="space-between" w="full">
                            <Text fontSize="sm" color="gray.600">Booking Date:</Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {new Date(flight.bookingDate).toLocaleDateString()}
                            </Text>
                          </Flex>
                          <Divider />
                          <Flex justify="space-between" w="full" pt={3}>
                            <Text fontSize="lg" fontWeight="bold" color="gray.900">Total Paid:</Text>
                            <Text fontSize="lg" fontWeight="bold" color="#283593">
                              ₹{flight.price * flight.passengers}
                            </Text>
                          </Flex>
                        </VStack>
                      </Box>
                      
                      <HStack spacing={3} mt={6}>
                        <Button
                          flex="1"
                          bgGradient="linear(to-r, green.600, green.700)"
                          color="white"
                          _hover={{ bgGradient: "linear(to-r, green.700, green.800)" }}
                          size="sm"
                          leftIcon={<DownloadIcon />}
                          onClick={() => handleDownloadTicket(flight)}
                          isLoading={isDownloading}
                          loadingText="Generating..."
                        >
                          Download Ticket
                        </Button>
                        <Button
                          flex="1"
                          bgGradient="linear(to-r, #1976d2, #283593)"
                          color="white"
                          _hover={{ bgGradient: "linear(to-r, #283593, #1565c0)" }}
                          size="sm"
                          leftIcon={<SettingsIcon />}
                          onClick={() => handleManageBooking(flight)}
                        >
                          Manage Booking
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            ) : (
              <VStack spacing={0} py={12}>
                <Card bg="white" shadow="xl" p={12} maxW="md" mx="auto">
                  <CardBody textAlign="center">
                    <Icon viewBox="0 0 24 24" w={16} h={16} color="gray.400" mb={6}>
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </Icon>
                    <Heading as="h3" size="lg" color="gray.900" mb={2}>
                      No Bookings Yet
                    </Heading>
                    <Text color="gray.500" mb={6}>
                      You haven't booked any flights yet. Start planning your next adventure!
                    </Text>
                    <Link href="/" _hover={{ textDecoration: "none" }}>
                      <Button
                        bgGradient="linear(to-r, #283593, #1976d2)"
                        color="white"
                        _hover={{ bgGradient: "linear(to-r, #1976d2, #283593)" }}
                        leftIcon={<SearchIcon />}
                        size="lg"
                      >
                        Search Flights
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              </VStack>
            )}
          </VStack>
        </Container>

        {/* Manage Booking Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader bgGradient="linear(to-r, #283593, #1976d2)" color="white">
              Manage Your Booking
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody py={6}>
              {selectedFlight && (
                <VStack spacing={6} align="stretch">
                  {/* Flight Summary */}
                  <Box bg="gray.50" p={4} borderRadius="md">
                    <Heading as="h4" size="md" mb={3} color="gray.900">
                      Flight Details
                    </Heading>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      {selectedFlight.bookingId && (
                        <Text fontSize="lg" fontWeight="bold" color="#283593" gridColumn="1 / -1">
                          <strong>Booking ID:</strong> {formatBookingReference(selectedFlight.bookingId)}
                        </Text>
                      )}
                      <Text><strong>Flight:</strong> {selectedFlight.airline} {selectedFlight.flightNumber}</Text>
                      <Text><strong>Route:</strong> {selectedFlight.from} → {selectedFlight.to}</Text>
                      <Text><strong>Departure:</strong> {new Date(selectedFlight.departureTime).toLocaleString()}</Text>
                      <Text><strong>Arrival:</strong> {new Date(selectedFlight.arrivalTime).toLocaleString()}</Text>
                      <Text><strong>Passengers:</strong> {selectedFlight.passengers}</Text>
                      <Text><strong>Total Paid:</strong> ₹{selectedFlight.price * selectedFlight.passengers}</Text>
                      {selectedFlight.departureTime && (
                        <Text gridColumn="1 / -1" fontSize="md" fontWeight="medium" 
                              color={getFlightStatus(selectedFlight.departureTime).color === 'green' ? 'green.600' : 
                                    getFlightStatus(selectedFlight.departureTime).color === 'blue' ? 'blue.600' :
                                    getFlightStatus(selectedFlight.departureTime).color === 'orange' ? 'orange.600' : 'gray.600'}>
                          <strong>Status:</strong> {getFlightStatus(selectedFlight.departureTime).emoji} {getFlightStatus(selectedFlight.departureTime).status}
                        </Text>
                      )}
                      {selectedFlight.paymentId && (
                        <Text fontSize="sm" color="gray.600" gridColumn="1 / -1">
                          <strong>Payment ID:</strong> {selectedFlight.paymentId}
                        </Text>
                      )}
                    </Grid>
                  </Box>

                  {/* Management Options */}
                  <VStack spacing={4} align="stretch">
                    <Heading as="h4" size="md" color="gray.900">
                      Available Actions
                    </Heading>
                    
                    <Card>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <Button
                            bgGradient="linear(to-r, blue.500, blue.600)"
                            color="white"
                            _hover={{ bgGradient: "linear(to-r, blue.600, blue.700)" }}
                            onClick={() => {
                              toast({
                                title: "Check-in Available",
                                description: "Online check-in opens 24 hours before departure.",
                                status: "info",
                                duration: 3000,
                                isClosable: true,
                              });
                            }}
                          >
                            🛂 Online Check-in
                          </Button>
                          
                          <Button
                            bgGradient="linear(to-r, purple.500, purple.600)"
                            color="white"
                            _hover={{ bgGradient: "linear(to-r, purple.600, purple.700)" }}
                            onClick={() => {
                              toast({
                                title: "Seat Selection",
                                description: "Choose your preferred seat for a comfortable journey.",
                                status: "info",
                                duration: 3000,
                                isClosable: true,
                              });
                            }}
                          >
                            💺 Select Seats
                          </Button>
                          
                          <Button
                            bgGradient="linear(to-r, orange.500, orange.600)"
                            color="white"
                            _hover={{ bgGradient: "linear(to-r, orange.600, orange.700)" }}
                            onClick={() => {
                              toast({
                                title: "Add Services",
                                description: "Enhance your journey with meals, baggage, and more.",
                                status: "info",
                                duration: 3000,
                                isClosable: true,
                              });
                            }}
                          >
                            🍽️ Add Meals & Services
                          </Button>
                          
                          <Button
                            bgGradient="linear(to-r, teal.500, teal.600)"
                            color="white"
                            _hover={{ bgGradient: "linear(to-r, teal.600, teal.700)" }}
                            onClick={() => {
                              toast({
                                title: "Contact Information",
                                description: "Update your contact details for this booking.",
                                status: "info",
                                duration: 3000,
                                isClosable: true,
                              });
                            }}
                          >
                            📞 Update Contact Info
                          </Button>
                          
                          <Button
                            bgGradient="linear(to-r, red.500, red.600)"
                            color="white"
                            _hover={{ bgGradient: "linear(to-r, red.600, red.700)" }}
                            onClick={() => {
                              toast({
                                title: "Cancellation Policy",
                                description: "Review terms and conditions for flight cancellation.",
                                status: "warning",
                                duration: 5000,
                                isClosable: true,
                              });
                            }}
                          >
                            ❌ Cancel Booking
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="sm">
                        For immediate assistance, contact our 24/7 support at <strong>1800-123-AIRRIDES</strong>
                      </Text>
                    </Alert>
                  </VStack>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="gray" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  }
  