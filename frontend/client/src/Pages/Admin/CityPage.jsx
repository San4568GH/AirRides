// AddCityPage.js

import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, VStack, Card, CardBody, FormControl, FormLabel, Input, Button, Grid, HStack, Icon } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import Cities from './Cities';

const cityInstance = Cities();

function CityPage () {
  const [cityName, setCityName] = useState('');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const getCities = async () => {
      const citiesData = await cityInstance.fetchCities();
      setCities(citiesData);
    };

    getCities();
  }, []);

  const handleAddCity = async (ev) => {
    ev.preventDefault();
    await cityInstance.addCity(cityName);
    setCityName('');
    const citiesData = await cityInstance.fetchCities();
    setCities(citiesData);
  };

  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-br, teal.50, cyan.100)" 
      py={12} 
      px={{ base: 4, sm: 6, lg: 8 }}
    >
      <Container maxW="4xl">
        <VStack spacing={8} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Heading as="h1" size="xl" color="gray.900">
              City Management
            </Heading>
            <Text color="gray.600">
              Add new cities to expand flight destinations
            </Text>
          </VStack>
          
          <Card bg="white" shadow="xl">
            <CardBody p={8}>
              <Heading as="h2" size="lg" color="gray.900" mb={6}>
                Add New City
              </Heading>
              <form onSubmit={handleAddCity}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel 
                      htmlFor="cityName" 
                      fontSize="sm" 
                      fontWeight="medium" 
                      color="gray.700"
                    >
                      City Name
                    </FormLabel>
                    <Input
                      id="cityName"
                      type="text"
                      placeholder="Enter city name"
                      value={cityName}
                      onChange={(ev) => setCityName(ev.target.value)}
                      focusBorderColor="teal.500"
                      _focus={{ 
                        borderColor: "teal.500",
                        boxShadow: "0 0 0 1px #14b8a6"
                      }}
                      size="lg"
                    />
                  </FormControl>
                  <Button 
                    type="submit" 
                    w="full"
                    bgGradient="linear(to-r, teal.600, teal.700)"
                    color="white"
                    _hover={{ 
                      bgGradient: "linear(to-r, teal.700, teal.800)",
                      transform: "scale(1.01)"
                    }}
                    leftIcon={<AddIcon />}
                    size="lg"
                    shadow="lg"
                    _focus={{ shadow: "xl" }}
                  >
                    Add City
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          <Card bg="white" shadow="xl">
            <CardBody p={8}>
              <Heading as="h2" size="lg" color="gray.900" mb={6}>
                Available Cities
              </Heading>
              {cities.length === 0 ? (
                <VStack spacing={4} py={8} textAlign="center">
                  <Icon viewBox="0 0 24 24" w={12} h={12} color="gray.400">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </Icon>
                  <Text color="gray.500">No cities added yet</Text>
                </VStack>
              ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                  {cities.map((city) => (
                    <Box 
                      key={city._id} 
                      bgGradient="linear(to-r, teal.50, cyan.50)"
                      border="1px"
                      borderColor="teal.200"
                      borderRadius="lg"
                      p={4}
                      _hover={{ shadow: "md" }}
                      transition="all 0.2s"
                    >
                      <HStack>
                        <Icon viewBox="0 0 24 24" w={5} h={5} color="teal.600">
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </Icon>
                        <Text color="gray.900" fontWeight="medium">
                          {city.name}
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                </Grid>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default CityPage
