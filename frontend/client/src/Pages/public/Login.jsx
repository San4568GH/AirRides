import { useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
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

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);
  const location = useLocation();

  // Get the intended destination from state, default to home
  const from = location.state?.from?.pathname || '/';

  // Color mode values based on App.css color scheme
  const bg = useColorModeValue('#f5faff', '#f5faff');
  const cardBg = useColorModeValue('white', 'white');
  const borderColor = useColorModeValue('#90caf9', '#90caf9');
  const headingColor = useColorModeValue('#283593', '#283593');
  const textColor = useColorModeValue('#666', '#666');
  const inputBorder = useColorModeValue('#bbdefb', '#bbdefb');
  const inputFocusBorder = useColorModeValue('#1976d2', '#1976d2');

  async function login(ev) {
    ev.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
        credentials: 'include',
      });

      if (!response.ok) {
        alert('Wrong credentials! Try Again');
        throw new Error('Failed to Login');
      } else {
        const responseData = await response.json();
        const { userInfo, isAdmin, isMasterAdmin } = responseData;
        
        // Ensure role is properly set
        if (!userInfo.role) {
          userInfo.role = isMasterAdmin ? 'master-admin' : (isAdmin ? 'admin' : 'passenger');
        }
        
        setUserInfo(userInfo);

        alert('Logged in successfully!');
        // Redirect to intended destination or admin/home based on role
        const redirectPath = from !== '/' ? from : (userInfo.role === 'master-admin' || userInfo.role === 'admin' ? '/admin' : '/');
        setRedirect(redirectPath);
      }
    } catch (error) {
      console.error('Error during Login:', error);
    }
  }

  useEffect(() => {
    if (redirect) {
      // Navigate without reload to preserve state
      // The Navigate component will handle the redirect
    }
  }, [redirect]);

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(90deg, #e3f2fd 0%, #fff 100%)"
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
                Sign in
              </Heading>
              <Text 
                color={textColor}
                fontSize="sm"
              >
                Welcome back! Please enter your details.
              </Text>
            </VStack>

            {/* Form */}
            <Box as="form" onSubmit={login} w="full">
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
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
                  bg="linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)"
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
                  boxShadow="0 2px 8px 0 rgba(25, 118, 210, 0.08)"
                  _hover={{
                    bg: "linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)",
                    boxShadow: "0 4px 16px 0 rgba(25, 118, 210, 0.12)"
                  }}
                >
                  Sign in
                </Button>

                {/* Footer */}
                <Center pt={4}>
                  <Text 
                    fontSize="sm" 
                    color={textColor}
                    textAlign="center"
                  >
                    Don't have an account?{' '}
                    <Link 
                      href="/register" 
                      color="#1976d2"
                      fontWeight="500"
                      _hover={{ color: "#1565c0" }}
                      transition="color 0.2s"
                    >
                      Sign up here
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
