import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Link,
  useColorModeValue,
  Center
} from '@chakra-ui/react';

// Code for Register Page
export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [redirect, setRedirect] = useState(false);

  // Color mode values based on App.css color scheme (using green theme for register)
  const bg = useColorModeValue('#f5faff', '#f5faff');
  const cardBg = useColorModeValue('white', 'white');
  const borderColor = useColorModeValue('#90caf9', '#90caf9');
  const headingColor = useColorModeValue('#283593', '#283593');
  const textColor = useColorModeValue('#666', '#666');
  const inputBorder = useColorModeValue('#bbdefb', '#bbdefb');
  const inputFocusBorder = useColorModeValue('#43a047', '#43a047'); // Green focus for register

  async function register(ev) {
    ev.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      } else {
        setRedirect(true);
        const data = await response.json();
        alert('Registration successful!');
        console.log('Registration successful:', data);
      }
    } catch (error) {
      alert('Failed to Register');
      console.error('Error during registration:', error);
    }
  }

  if (redirect) {
    return <Navigate to={'/login'} />;
  }

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #e8f5e8 0%, #e3f2fd 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Container maxW="md" centerContent>
        <Box
          bg={cardBg}
          p={8}
          borderRadius="16px"
          border="1.5px solid"
          borderColor={borderColor}
          boxShadow="0 4px 16px 0 rgba(25, 118, 210, 0.07)"
          w="full"
          maxW="420px"
        >
          <VStack spacing={6} align="center">
            {/* Headings */}
            <VStack spacing={2} textAlign="center" w="full">
              <Heading 
                as="h1" 
                size="xl" 
                color={headingColor}
                fontFamily="'Poppins', 'Montserrat', sans-serif"
                fontWeight="700"
                letterSpacing="0.03em"
              >
                Create your account
              </Heading>
              <Text 
                color={textColor}
                fontSize="sm"
              >
                Join us today! Please fill in your details.
              </Text>
            </VStack>

            {/* Form */}
            <Box as="form" onSubmit={register} w="full">
              <VStack spacing={4}>
                {/* Username */}
                <FormControl isRequired>
                  <FormLabel 
                    color={headingColor}
                    fontWeight="500"
                    fontSize="sm"
                  >
                    Username
                  </FormLabel>
                  <Input
                    type="text"
                    value={username}
                    onChange={(ev) => setUsername(ev.target.value)}
                    placeholder="Choose a username"
                    borderColor={inputBorder}
                    borderWidth="2px"
                    borderRadius="8px"
                    bg="white"
                    color="black"
                    fontSize="1rem"
                    p="12px"
                    _placeholder={{ color: '#999' }}
                    _focus={{
                      borderColor: inputFocusBorder,
                      boxShadow: 'none'
                    }}
                    transition="border-color 0.2s"
                  />
                </FormControl>

                {/* Email */}
                <FormControl isRequired>
                  <FormLabel 
                    color={headingColor}
                    fontWeight="500"
                    fontSize="sm"
                  >
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder="Enter your email address"
                    borderColor={inputBorder}
                    borderWidth="2px"
                    borderRadius="8px"
                    bg="white"
                    color="black"
                    fontSize="1rem"
                    p="12px"
                    _placeholder={{ color: '#999' }}
                    _focus={{
                      borderColor: inputFocusBorder,
                      boxShadow: 'none'
                    }}
                    transition="border-color 0.2s"
                  />
                </FormControl>

                {/* Password */}
                <FormControl isRequired>
                  <FormLabel 
                    color={headingColor}
                    fontWeight="500"
                    fontSize="sm"
                  >
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                    placeholder="Create a secure password"
                    borderColor={inputBorder}
                    borderWidth="2px"
                    borderRadius="8px"
                    bg="white"
                    color="black"
                    fontSize="1rem"
                    p="12px"
                    _placeholder={{ color: '#999' }}
                    _focus={{
                      borderColor: inputFocusBorder,
                      boxShadow: 'none'
                    }}
                    transition="border-color 0.2s"
                  />
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  w="full"
                  bg="linear-gradient(90deg, #43a047 0%, #66bb6a 100%)"
                  color="white"
                  borderRadius="8px"
                  fontSize="1.05em"
                  fontWeight="600"
                  py="0.6em"
                  px="1.5em"
                  mt={2}
                  border="none"
                  cursor="pointer"
                  transition="all 0.2s"
                  boxShadow="0 2px 8px 0 rgba(67, 160, 71, 0.08)"
                  _hover={{
                    bg: "linear-gradient(90deg, #388e3c 0%, #81c784 100%)",
                    boxShadow: "0 4px 16px 0 rgba(67, 160, 71, 0.12)"
                  }}
                >
                  Create Account
                </Button>

                {/* Footer */}
                <Center pt={4}>
                  <Text 
                    fontSize="sm" 
                    color={textColor}
                    textAlign="center"
                  >
                    Already have an account?{' '}
                    <Link 
                      href="/login" 
                      color="#43a047"
                      fontWeight="500"
                      _hover={{ color: "#388e3c" }}
                      transition="color 0.2s"
                    >
                      Sign in here
                    </Link>
                  </Text>
                </Center>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
