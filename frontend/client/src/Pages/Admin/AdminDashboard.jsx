import React, { useContext } from 'react';
import { Box, Container, Heading, Text, Grid, Card, CardBody, VStack, HStack, Icon, Button, Circle, useColorModeValue, Badge, Flex } from '@chakra-ui/react';
import { AddIcon, ViewIcon, TimeIcon, SettingsIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

function AdminDashboard() {
  const { userInfo } = useContext(UserContext);
  
  // Color mode values for better theming
  const bgGradient = useColorModeValue(
    "linear(to-br, #f5faff, #bbdefb)",
    "linear(to-br, gray.900, gray.800)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.900", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");

  // Determine admin type and badge color
  const isMasterAdmin = userInfo?.role === 'master-admin';
  const isAssignedAdmin = userInfo?.role === 'admin';
  const adminType = isMasterAdmin ? 'Master Admin' : isAssignedAdmin ? 'Assigned Admin' : 'Admin';
  const badgeColor = isMasterAdmin ? 'red' : 'blue';

  return (
    <Box 
      minH="100vh" 
      bgGradient={bgGradient}
      py={8} 
      px={{ base: 4, sm: 6, lg: 8 }}
    >
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          <VStack spacing={4} textAlign="center">
            <Flex direction="column" align="center" gap={3}>
              <Heading 
                as="h1" 
                size="xl" 
                color={textColor}
                bgGradient="linear(to-r, #283593, #1976d2)"
                bgClip="text"
              >
                Admin Dashboard
              </Heading>
              <HStack spacing={3} align="center">
                <Badge 
                  colorScheme={badgeColor} 
                  fontSize="sm" 
                  px={3} 
                  py={1} 
                  borderRadius="full"
                  fontWeight="medium"
                >
                  {adminType}
                </Badge>
                {userInfo?.name && (
                  <Text fontSize="md" color={mutedTextColor}>
                    Welcome, {userInfo.name}
                  </Text>
                )}
              </HStack>
            </Flex>
            <Text fontSize="lg" color={mutedTextColor}>
              Manage your airline operations efficiently
            </Text>
          </VStack>
          
          {/* Main Management Cards */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            {/* Manage Cities Card */}
            <Card 
              bg={cardBg} 
              shadow="xl" 
              _hover={{ shadow: "2xl", transform: "scale(1.02)" }}
              transition="all 0.3s"
              borderRadius="lg"
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
                <Heading as="h2" size="lg" color={textColor} mb={3}>
                  Manage Cities
                </Heading>
                <Text color={mutedTextColor} mb={6}>
                  Add new cities to expand flight destinations and manage existing locations.
                </Text>
                <Button
                  as={Link}
                  to="/admin/cities"
                  w="full"
                  bgGradient="linear(to-r, teal.600, cyan.600)"
                  color="white"
                  _hover={{ 
                    bgGradient: "linear(to-r, teal.700, cyan.700)",
                    transform: "scale(1.05)"
                  }}
                  leftIcon={<AddIcon />}
                  size="md"
                  shadow="lg"
                  _focus={{ shadow: "xl" }}
                >
                  Manage Cities
                </Button>
              </CardBody>
            </Card>

            {/* Manage Flights Card */}
            <Card 
              bg={cardBg} 
              shadow="xl" 
              _hover={{ shadow: "2xl", transform: "scale(1.02)" }}
              transition="all 0.3s"
              borderRadius="lg"
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
                <Heading as="h2" size="lg" color={textColor} mb={3}>
                  Manage Flights
                </Heading>
                <Text color={mutedTextColor} mb={6}>
                  Add new flights, set schedules, pricing, and manage flight operations.
                </Text>
                <Button
                  as={Link}
                  to="/admin/flights"
                  w="full"
                  bgGradient="linear(to-r, #1976d2, #283593)"
                  color="white"
                  _hover={{ 
                    bgGradient: "linear(to-r, #283593, #1565c0)",
                    transform: "scale(1.05)"
                  }}
                  leftIcon={<AddIcon />}
                  size="md"
                  shadow="lg"
                  _focus={{ shadow: "xl" }}
                >
                  Manage Flights
                </Button>
              </CardBody>
            </Card>
          </Grid>

          {/* Quick Actions Section */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg">
            <CardBody p={8}>
              <Heading as="h3" size="lg" color={textColor} mb={6} textAlign="center">
                Quick Actions
              </Heading>
              <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                <Button
                  as={Link}
                  to="/admin/bookings"
                  variant="outline"
                  borderColor="green.500"
                  color="green.600"
                  _hover={{ 
                    bg: "green.50",
                    borderColor: "green.600",
                    transform: "scale(1.05)"
                  }}
                  h="auto"
                  p={4}
                  flexDirection="column"
                  leftIcon={<ViewIcon />}
                >
                  <Icon viewBox="0 0 24 24" w={8} h={8} mb={2}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium" textAlign="center">
                    View Bookings
                  </Text>
                </Button>

                <Button
                  as={Link}
                  to="/admin/schedules"
                  variant="outline"
                  borderColor="yellow.500"
                  color="yellow.600"
                  _hover={{ 
                    bg: "yellow.50",
                    borderColor: "yellow.600",
                    transform: "scale(1.05)"
                  }}
                  h="auto"
                  p={4}
                  flexDirection="column"
                  leftIcon={<TimeIcon />}
                >
                  <Icon viewBox="0 0 24 24" w={8} h={8} mb={2}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium" textAlign="center">
                    Flight Schedules
                  </Text>
                </Button>

                <Button
                  as={Link}
                  to="/admin/users"
                  variant="outline"
                  borderColor="purple.500"
                  color="purple.600"
                  _hover={{ 
                    bg: "purple.50",
                    borderColor: "purple.600",
                    transform: "scale(1.05)"
                  }}
                  h="auto"
                  p={4}
                  flexDirection="column"
                  leftIcon={<SettingsIcon />}
                >
                  <Icon viewBox="0 0 24 24" w={8} h={8} mb={2}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium" textAlign="center">
                    User Management
                  </Text>
                </Button>

                <Button
                  as={Link}
                  to="/admin/analytics"
                  variant="outline"
                  borderColor="blue.500"
                  color="blue.600"
                  _hover={{ 
                    bg: "blue.50",
                    borderColor: "blue.600",
                    transform: "scale(1.05)"
                  }}
                  h="auto"
                  p={4}
                  flexDirection="column"
                  leftIcon={<ViewIcon />}
                >
                  <Icon viewBox="0 0 24 24" w={8} h={8} mb={2}>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </Icon>
                  <Text fontSize="sm" fontWeight="medium" textAlign="center">
                    Analytics
                  </Text>
                </Button>
              </Grid>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
