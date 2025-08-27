
import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  Button,
  Circle
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

function AdminPage() {
  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-br, #f5faff, #bbdefb)" 
      py={12} 
      px={{ base: 4, sm: 6, lg: 8 }}
    >
      <Container maxW="4xl">
        <VStack spacing={12} align="stretch">
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="2xl" color="gray.900">
              Admin Dashboard
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Manage your airline operations
            </Text>
          </VStack>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
            {/* Add Cities Card */}
            <Card 
              bg="white" 
              shadow="xl" 
              _hover={{ shadow: "2xl", transform: "scale(1.02)" }}
              transition="all 0.3s"
            >
              <CardBody p={8} textAlign="center">
                <Circle 
                  size="16" 
                  bgGradient="linear(to-r, teal.500, cyan.600)" 
                  mx="auto" 
                  mb={6}
                  color="white"
                >
                  <Icon viewBox="0 0 24 24" w={8} h={8}>
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
                </Circle>
                <Heading as="h2" size="xl" color="gray.900" mb={3}>
                  Manage Cities
                </Heading>
                <Text color="gray.600" mb={6}>
                  Add new cities to expand flight destinations and manage existing locations.
                </Text>
                <Button
                  as={Link}
                  to="/admin/add-cities"
                  w="full"
                  bgGradient="linear(to-r, teal.600, cyan.600)"
                  color="white"
                  _hover={{ 
                    bgGradient: "linear(to-r, teal.700, cyan.700)",
                    transform: "scale(1.05)"
                  }}
                  leftIcon={<AddIcon />}
                  size="lg"
                  shadow="lg"
                  _focus={{ shadow: "xl" }}
                >
                  Manage Cities
                </Button>
              </CardBody>
            </Card>

            {/* Add Flights Card */}
            <Card 
              bg="white" 
              shadow="xl" 
              _hover={{ shadow: "2xl", transform: "scale(1.02)" }}
              transition="all 0.3s"
            >
              <CardBody p={8} textAlign="center">
                <Circle 
                  size="16" 
                  bgGradient="linear(to-r, #1976d2, #283593)" 
                  mx="auto" 
                  mb={6}
                  color="white"
                >
                  <Icon viewBox="0 0 24 24" w={8} h={8}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </Icon>
                </Circle>
                <Heading as="h2" size="xl" color="gray.900" mb={3}>
                  Manage Flights
                </Heading>
                <Text color="gray.600" mb={6}>
                  Add new flights, set schedules, pricing, and manage flight operations.
                </Text>
                <Button
                  as={Link}
                  to="/admin/add-flight"
                  w="full"
                  bgGradient="linear(to-r, #1976d2, #283593)"
                  color="white"
                  _hover={{ 
                    bgGradient: "linear(to-r, #283593, #1565c0)",
                    transform: "scale(1.05)"
                  }}
                  leftIcon={<AddIcon />}
                  size="lg"
                  shadow="lg"
                  _focus={{ shadow: "xl" }}
                >
                  Manage Flights
                </Button>
              </CardBody>
            </Card>
          </Grid>

          {/* Quick Stats Section */}
          <Card bg="white" shadow="xl">
            <CardBody p={8}>
              <Heading as="h3" size="lg" color="gray.900" mb={6} textAlign="center">
                Admin Quick Actions
              </Heading>
              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                <VStack 
                  spacing={3} 
                  p={4} 
                  bgGradient="linear(to-br, green.50, green.100)" 
                  borderRadius="lg"
                  textAlign="center"
                >
                  <Icon viewBox="0 0 24 24" w={10} h={10} color="green.600">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium" color="green.800">
                    Monitor bookings and revenue
                  </Text>
                </VStack>
                <VStack 
                  spacing={3} 
                  p={4} 
                  bgGradient="linear(to-br, yellow.50, yellow.100)" 
                  borderRadius="lg"
                  textAlign="center"
                >
                  <Icon viewBox="0 0 24 24" w={10} h={10} color="yellow.600">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium" color="yellow.800">
                    Manage flight schedules
                  </Text>
                </VStack>
                <VStack 
                  spacing={3} 
                  p={4} 
                  bgGradient="linear(to-br, purple.50, purple.100)" 
                  borderRadius="lg"
                  textAlign="center"
                >
                  <Icon viewBox="0 0 24 24" w={10} h={10} color="purple.600">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium" color="purple.800">
                    User management
                  </Text>
                </VStack>
              </Grid>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminPage;