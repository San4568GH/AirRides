import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, VStack, HStack, Card, CardBody, Button, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, useToast, useColorModeValue, Alert, AlertIcon, Stat, StatLabel, StatNumber, StatHelpText, Grid, GridItem, Select, Input } from '@chakra-ui/react';
import { ArrowBackIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

function ViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:4000/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch bookings",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.to?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const calculateStats = () => {
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;

    return { totalBookings, totalRevenue, confirmedBookings, pendingBookings };
  };

  const stats = calculateStats();

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} py={8} px={{ base: 4, sm: 6, lg: 8 }}>
        <Container maxW="6xl">
          <VStack spacing={8}>
            <Text color={textColor}>Loading bookings...</Text>
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
              View Bookings
            </Heading>
            <Text fontSize="lg" color={mutedTextColor}>
              Monitor bookings and revenue
            </Text>
          </VStack>

          {/* Stats Cards */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
            <Card bg={cardBg} shadow="lg">
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Total Bookings</StatLabel>
                  <StatNumber color={textColor}>{stats.totalBookings}</StatNumber>
                  <StatHelpText color={mutedTextColor}>All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} shadow="lg">
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Total Revenue</StatLabel>
                  <StatNumber color={textColor}>₹{stats.totalRevenue.toLocaleString()}</StatNumber>
                  <StatHelpText color={mutedTextColor}>All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} shadow="lg">
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Confirmed</StatLabel>
                  <StatNumber color="green.500">{stats.confirmedBookings}</StatNumber>
                  <StatHelpText color={mutedTextColor}>Bookings</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg={cardBg} shadow="lg">
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Pending</StatLabel>
                  <StatNumber color="yellow.500">{stats.pendingBookings}</StatNumber>
                  <StatHelpText color={mutedTextColor}>Bookings</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>

          {/* Filters */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg">
            <CardBody p={6}>
              <VStack spacing={4}>
                <Heading size="md" color={textColor}>
                  Filter Bookings
                </Heading>
                <HStack spacing={4} w="full">
                  <Input
                    placeholder="Search by flight number, passenger name, or route"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    focusBorderColor="#1976d2"
                    _focus={{ 
                      borderColor: "#1976d2",
                      boxShadow: "0 0 0 1px #1976d2"
                    }}
                  />
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    maxW="200px"
                    focusBorderColor="#1976d2"
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Bookings Table */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg">
            <CardBody p={8}>
              <Heading size="md" color={textColor} mb={6}>
                Bookings ({filteredBookings.length})
              </Heading>
              
              {filteredBookings.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  No bookings found matching your criteria.
                </Alert>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr bg={useColorModeValue("gray.50", "gray.700")}>
                        <Th color={mutedTextColor}>Booking ID</Th>
                        <Th color={mutedTextColor}>Passenger</Th>
                        <Th color={mutedTextColor}>Flight</Th>
                        <Th color={mutedTextColor}>Route</Th>
                        <Th color={mutedTextColor}>Date</Th>
                        <Th color={mutedTextColor}>Passengers</Th>
                        <Th color={mutedTextColor}>Amount</Th>
                        <Th color={mutedTextColor}>Status</Th>
                        <Th color={mutedTextColor}>Booking Date</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredBookings.map((booking) => (
                        <Tr key={booking._id} _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}>
                          <Td>
                            <Text fontSize="sm" fontFamily="mono" color={textColor}>
                              {booking._id?.slice(-8) || 'N/A'}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={textColor}>
                              {booking.passengerName || 'N/A'}
                            </Text>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                {booking.flightNumber || 'N/A'}
                              </Text>
                              <Text fontSize="xs" color={mutedTextColor}>
                                {booking.airline || 'N/A'}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={textColor}>
                              {booking.from} → {booking.to}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={textColor}>
                              {booking.departureDate ? format(new Date(booking.departureDate), 'dd/MM/yyyy') : 'N/A'}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={textColor}>
                              {booking.passengers || 1}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>
                              ₹{booking.totalAmount?.toLocaleString() || 0}
                            </Text>
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme={getStatusColor(booking.status)}
                              fontSize="xs"
                            >
                              {booking.status || 'pending'}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={textColor}>
                              {booking.createdAt ? format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                            </Text>
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

export default ViewBookings;
