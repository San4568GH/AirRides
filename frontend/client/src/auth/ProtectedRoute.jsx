import React, { useContext } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { Box, Container, VStack, Heading, Text, Button, Alert, AlertIcon, Spinner, useColorModeValue } from '@chakra-ui/react';

const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const { userInfo, isLoading } = useContext(UserContext);
  const location = useLocation();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, #f5faff, #bbdefb)",
    "linear(to-br, gray.900, gray.800)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.900", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box 
        minH="100vh" 
        bgGradient={bgGradient}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={textColor}>Verifying authentication...</Text>
        </VStack>
      </Box>
    );
  }

  // Check if user is logged in
  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRole === 'admin') {
    // Allow access for both Master Admin and Assigned Admin
    const isMasterAdmin = userInfo.role === 'master-admin';
    const isAssignedAdmin = userInfo.role === 'admin';
    
    if (!isMasterAdmin && !isAssignedAdmin) {
      return (
        <Box 
          minH="100vh" 
          bgGradient={bgGradient}
          py={8} 
          px={{ base: 4, sm: 6, lg: 8 }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Container maxW="md">
            <VStack spacing={8} textAlign="center">
              <Heading 
                as="h1" 
                size="xl" 
                color={textColor}
                bgGradient="linear(to-r, #d32f2f, #f44336)"
                bgClip="text"
              >
                Access Denied
              </Heading>
              
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="semibold">
                    Administrator Access Required
                  </Text>
                  <Text fontSize="sm">
                    You need administrator privileges to access this area.
                  </Text>
                </VStack>
              </Alert>

              <VStack spacing={4} w="full">
                <Text color={mutedTextColor} textAlign="center">
                  If you believe you should have access to this area, please contact your system administrator.
                </Text>
                
                <VStack spacing={3} w="full">
                  <Button
                    as={Link}
                    to="/dashboard"
                    bgGradient="linear(to-r, #283593, #1976d2)"
                    color="white"
                    _hover={{ bgGradient: "linear(to-r, #1976d2, #283593)" }}
                    size="lg"
                    w="full"
                  >
                    Go to Dashboard
                  </Button>
                  
                  <Button
                    as={Link}
                    to="/"
                    variant="ghost"
                    color={textColor}
                    size="lg"
                    w="full"
                  >
                    Back to Home
                  </Button>
                </VStack>
              </VStack>
            </VStack>
          </Container>
        </Box>
      );
    }
  }

  // If user is authenticated and has required role, render the protected component
  return children;
};

export default ProtectedRoute;
