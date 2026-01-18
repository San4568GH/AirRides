import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, VStack, HStack, Card, CardBody, Button, FormControl, FormLabel, Input, Grid, Badge, Table, Thead, Tbody, Tr, Th, Td, TableContainer, IconButton, useToast, useColorModeValue, Alert, AlertIcon } from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

function ManageCities() {
  const [cities, setCities] = useState([]);
  const [newCity, setNewCity] = useState('');
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

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCity.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCity.trim() }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "City added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setNewCity('');
        fetchCities();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to add city",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add city",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCity = async (cityId) => {
    if (!window.confirm('Are you sure you want to delete this city?')) return;

    try {
      const response = await fetch(`http://localhost:4000/cities/${cityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "City deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchCities();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete city",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete city",
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
      <Container maxW="4xl">
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
              Manage Cities
            </Heading>
            <Text fontSize="lg" color={mutedTextColor}>
              Add and manage flight destinations
            </Text>
          </VStack>

          {/* Add City Form */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg">
            <CardBody p={6}>
              <Heading size="md" color={textColor} mb={4}>
                Add New City
              </Heading>
              <form onSubmit={handleAddCity}>
                <HStack spacing={4}>
                  <FormControl flex={1}>
                    <Input
                      placeholder="Enter city name"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      focusBorderColor="#1976d2"
                      _focus={{ 
                        borderColor: "#1976d2",
                        boxShadow: "0 0 0 1px #1976d2"
                      }}
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    bgGradient="linear(to-r, #283593, #1976d2)"
                    color="white"
                    _hover={{ bgGradient: "linear(to-r, #1976d2, #283593)" }}
                    leftIcon={<AddIcon />}
                    isLoading={loading}
                    loadingText="Adding..."
                  >
                    Add City
                  </Button>
                </HStack>
              </form>
            </CardBody>
          </Card>

          {/* Cities List */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg">
            <CardBody p={6}>
              <Heading size="md" color={textColor} mb={4}>
                Existing Cities ({cities.length})
              </Heading>
              
              {cities.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  No cities found. Add your first city above.
                </Alert>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr>
                        <Th color={mutedTextColor}>City Name</Th>
                        <Th color={mutedTextColor}>Date Added</Th>
                        <Th color={mutedTextColor}>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {cities.map((city) => (
                        <Tr key={city._id} _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}>
                          <Td>
                            <Text fontWeight="medium" color={textColor}>
                              {city.name}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={mutedTextColor}>
                              {new Date(city.createdAt || Date.now()).toLocaleDateString()}
                            </Text>
                          </Td>
                          <Td>
                            <IconButton
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCity(city._id)}
                              aria-label="Delete city"
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

export default ManageCities;
