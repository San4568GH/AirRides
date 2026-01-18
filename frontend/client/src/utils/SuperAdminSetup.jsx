import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, VStack, Card, CardBody, Button, FormControl, FormLabel, Input, Alert, AlertIcon, useToast, useColorModeValue, HStack, Code } from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { Navigate } from 'react-router-dom';

function SuperAdminSetup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
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
    checkForExistingAdmin();
  }, []);

  const checkForExistingAdmin = async () => {
    try {
      const response = await fetch('http://localhost:4000/check-admin');
      if (response.ok) {
        const data = await response.json();
        // Only show setup if no assigned admin exists (Master Admin always exists)
        setAdminExists(data.assignedAdminExists);
      }
    } catch (error) {
      console.error('Error checking for admin:', error);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleCreateSuperAdmin = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/setup-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          role: 'admin'
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Assigned admin created successfully! You can now log in.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setAdminExists(true);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to create assigned admin",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assigned admin",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} py={8} px={{ base: 4, sm: 6, lg: 8 }}>
        <Container maxW="md">
          <VStack spacing={8}>
            <Text color={textColor}>Checking for existing admin...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (adminExists) {
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
            <CheckIcon boxSize={16} color="green.500" />
            <Heading 
              as="h1" 
              size="xl" 
              color={textColor}
              bgGradient="linear(to-r, #2e7d32, #4caf50)"
              bgClip="text"
            >
              Setup Complete
            </Heading>
            
            <Alert status="success" borderRadius="lg">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <Text fontWeight="semibold">
                  Assigned admin already exists
                </Text>
                <Text fontSize="sm">
                  An assigned admin has been set up. Use the login page to access the admin area with either Master Admin or Assigned Admin credentials.
                </Text>
              </VStack>
            </Alert>

            <Button
              as="a"
              href="/login"
              bgGradient="linear(to-r, #283593, #1976d2)"
              color="white"
              _hover={{ bgGradient: "linear(to-r, #1976d2, #283593)" }}
              size="lg"
              w="full"
            >
              Go to Login
            </Button>
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
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <WarningIcon boxSize={12} color="orange.500" />
            <Heading 
              as="h1" 
              size="xl" 
              color={textColor}
              bgGradient="linear(to-r, #283593, #1976d2)"
              bgClip="text"
            >
              Assigned Admin Setup
            </Heading>
            <Text fontSize="lg" color={mutedTextColor}>
              Create an assigned administrator account for the airline system
            </Text>
          </VStack>

          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Text fontWeight="semibold">
                Assigned Admin Setup Available
              </Text>
              <Text fontSize="sm">
                A Master Admin exists. You can create assigned admin accounts for additional access.
              </Text>
            </VStack>
          </Alert>

          <Card bg={cardBg} shadow="xl" borderRadius="lg" w="full">
            <CardBody p={8}>
              <form onSubmit={handleCreateSuperAdmin}>
                <VStack spacing={6}>
                  <Heading size="md" color={textColor} textAlign="center">
                    Create Assigned Admin
                  </Heading>
                  
                  <FormControl isRequired>
                    <FormLabel color={textColor}>Full Name</FormLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      focusBorderColor="#1976d2"
                      _focus={{ 
                        borderColor: "#1976d2",
                        boxShadow: "0 0 0 1px #1976d2"
                      }}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel color={textColor}>Email</FormLabel>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      focusBorderColor="#1976d2"
                      _focus={{ 
                        borderColor: "#1976d2",
                        boxShadow: "0 0 0 1px #1976d2"
                      }}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel color={textColor}>Username</FormLabel>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter username"
                      focusBorderColor="#1976d2"
                      _focus={{ 
                        borderColor: "#1976d2",
                        boxShadow: "0 0 0 1px #1976d2"
                      }}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel color={textColor}>Password</FormLabel>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password (min 6 characters)"
                      focusBorderColor="#1976d2"
                      _focus={{ 
                        borderColor: "#1976d2",
                        boxShadow: "0 0 0 1px #1976d2"
                      }}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel color={textColor}>Confirm Password</FormLabel>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
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
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="Creating Admin..."
                  >
                    Create Assigned Admin
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md" borderRadius="lg" w="full">
            <CardBody p={6}>
              <VStack spacing={3}>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  Security Note
                </Text>
                <Text fontSize="xs" color={mutedTextColor} textAlign="center">
                  This setup page will be automatically disabled after creating the first admin. 
                  Additional admin users can be created through the User Management section.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}

export default SuperAdminSetup;
