import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import {
  Box,
  Flex,
  HStack,
  Image,
  Text,
  Button,
  useColorModeValue
} from '@chakra-ui/react';

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  async function logout() {
    const confirmLogout = window.confirm('Are you sure you want to log out?');

    if (confirmLogout) {
      try {
        const response = await fetch('http://localhost:4000/logout', {
          credentials: 'include',
          method: 'POST',
        });

        if (response.ok) {
          // Clear user info and localStorage
          setUserInfo(null);
          localStorage.removeItem('userInfo');
          alert('Successfully Logged out.');
          console.log('Logged out successfully');
          // Force page reload to ensure clean state
          window.location.href = '/';
        } else {
          alert('Unexpected Error while logging out');
          console.error('Failed to log out');
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  }

  const username = userInfo?.username;

  // Color values based on App.css header styles
  const headerBg = "linear-gradient(90deg, #283593 0%, #1976d2 100%)";
  const borderColor = "#1a237e";
  const linkColor = "white";
  const linkHoverBg = "white";
  const linkHoverColor = "#1976d2";

  return (
    <Box
      as="header"
      w="full"
      bg={headerBg}
      px="40px"
      py="20px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      color="white"
      borderBottom="2px solid"
      borderBottomColor={borderColor}
      minH="72px"
      letterSpacing="0.03em"
      boxShadow="0 2px 12px 0 rgba(25, 118, 210, 0.08)"
    >
      <Box 
  as={Link} 
  to="/" 
  textDecoration="none"
  _hover={{ bg: "transparent" }} // ⬅ disables white hover background
>
  <Flex
    alignItems="center"
    gap="10px"
    fontFamily="'Poppins', 'Montserrat', Verdana, Geneva, Tahoma, sans-serif"
    fontSize="2rem"
    fontWeight="700"
    letterSpacing="0.08em"
    cursor="pointer"
    _hover={{ bg: "transparent" }} // ⬅ prevent hover bg here too
  >
    <Image 
      src="/logo.svg" 
      alt="logo" 
      h="40px" 
      verticalAlign="middle" 
    />
    <Text
      fontFamily="'Audiowide', sans-serif"
      fontWeight="700"
      letterSpacing="0.1em"
      fontSize="2xl"
      color="white"
      textShadow="sm"
      _hover={{ color: "white", bg: "transparent" }} // ⬅ lock hover color
    >
      AirRides
    </Text>
  </Flex>
</Box>

      
      <HStack as="nav" spacing="20px">
        {username && (
          <>
            {(userInfo?.role === 'master-admin' || userInfo?.role === 'admin' || username === 'admin') && (
              <Link to='/admin'>
                <Button
                  variant="ghost"
                  color={linkColor}
                  fontWeight="500"
                  px="10px"
                  py="4px"
                  borderRadius="6px"
                  _hover={{
                    color: linkHoverColor,
                    bg: linkHoverBg
                  }}
                  transition="all 0.2s"
                >
                  Admin Panel
                </Button>
              </Link>
            )}
            <Text fontWeight="500">
              Welcome, <Box as="b">{username}</Box>!!
            </Text>
            <Link to="/dashboard">
              <Button
                variant="ghost"
                color={linkColor}
                fontWeight="500"
                px="10px"
                py="4px"
                borderRadius="6px"
                _hover={{
                  color: linkHoverColor,
                  bg: linkHoverBg
                }}
                transition="all 0.2s"
              >
                Dashboard
              </Button>
            </Link>
            <Button
              variant="ghost"
              color={linkColor}
              fontWeight="500"
              px="10px"
              py="4px"
              borderRadius="6px"
              _hover={{
                color: linkHoverColor,
                bg: linkHoverBg
              }}
              transition="all 0.2s"
              onClick={logout}
              cursor="pointer"
            >
              Logout
            </Button>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">
              <Button
                variant="ghost"
                color={linkColor}
                fontWeight="500"
                px="10px"
                py="4px"
                borderRadius="6px"
                _hover={{
                  color: linkHoverColor,
                  bg: linkHoverBg
                }}
                transition="all 0.2s"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="ghost"
                color={linkColor}
                fontWeight="500"
                px="10px"
                py="4px"
                borderRadius="6px"
                _hover={{
                  color: linkHoverColor,
                  bg: linkHoverBg
                }}
                transition="all 0.2s"
              >
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </HStack>
    </Box>
  );
}
