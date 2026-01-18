import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, VStack, HStack, Card, CardBody, Button, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, useToast, useColorModeValue, Alert, AlertIcon, Grid, GridItem, Select, Input, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, FormControl, FormLabel, Textarea, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Avatar, Flex, Spacer } from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, DeleteIcon, AddIcon, EmailIcon, PhoneIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    role: 'passenger'
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/users');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        setUsers(Array.isArray(data) ? data : []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!users || !Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }
    
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => (user.role || 'passenger') === roleFilter);
    }

    // Sort by name with null checks
    filtered.sort((a, b) => {
      const nameA = a.name || a.username || '';
      const nameB = b.name || b.username || '';
      return nameA.localeCompare(nameB);
    });
    setFilteredUsers(filtered);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      age: '',
      gender: '',
      role: 'passenger'
    });
    onOpen();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      age: user.age || '',
      gender: user.gender || '',
      role: user.role || 'passenger'
    });
    onOpen();
  };

  const handleSaveUser = async () => {
    try {
      let response;
      if (isEditMode) {
        response = await fetch(`http://localhost:4000/users/${selectedUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('http://localhost:4000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${isEditMode ? 'updated' : 'created'} successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchUsers();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || `Failed to ${isEditMode ? 'update' : 'create'} user`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} user`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:4000/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchUsers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete user",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getUserInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'staff': return 'blue';
      case 'passenger': return 'green';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} py={8} px={{ base: 4, sm: 6, lg: 8 }}>
        <Container maxW="6xl">
          <VStack spacing={8}>
            <Text color={textColor}>Loading users...</Text>
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
              <Button
                leftIcon={<AddIcon />}
                bgGradient="linear(to-r, #283593, #1976d2)"
                color="white"
                _hover={{ bgGradient: "linear(to-r, #1976d2, #283593)" }}
                onClick={handleAddUser}
              >
                Add User
              </Button>
            </HStack>
            <Heading 
              as="h1" 
              size="xl" 
              color={textColor}
              bgGradient="linear(to-r, #283593, #1976d2)"
              bgClip="text"
            >
              User Management
            </Heading>
            <Text fontSize="lg" color={mutedTextColor}>
              Manage system users and their roles
            </Text>
          </VStack>

          {/* User Stats */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
            <Card bg={cardBg} shadow="xl" borderRadius="lg">
              <CardBody textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="#283593">
                  {users.length}
                </Text>
                <Text fontSize="sm" color={mutedTextColor}>Total Users</Text>
              </CardBody>
            </Card>
            <Card bg={cardBg} shadow="xl" borderRadius="lg">
              <CardBody textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="#1976d2">
                  {users.filter(u => u.role === 'admin').length}
                </Text>
                <Text fontSize="sm" color={mutedTextColor}>Admins</Text>
              </CardBody>
            </Card>
            <Card bg={cardBg} shadow="xl" borderRadius="lg">
              <CardBody textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="#2e7d32">
                  {users.filter(u => u.role === 'staff').length}
                </Text>
                <Text fontSize="sm" color={mutedTextColor}>Staff</Text>
              </CardBody>
            </Card>
            <Card bg={cardBg} shadow="xl" borderRadius="lg">
              <CardBody textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="#ed6c02">
                  {users.filter(u => u.role === 'passenger').length}
                </Text>
                <Text fontSize="sm" color={mutedTextColor}>Passengers</Text>
              </CardBody>
            </Card>
          </Grid>

          {/* Filters */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg">
            <CardBody p={6}>
              <VStack spacing={4}>
                <Heading size="md" color={textColor}>
                  Filter Users
                </Heading>
                <HStack spacing={4} w="full">
                  <Input
                    placeholder="Search by name, email, or phone"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    focusBorderColor="#1976d2"
                    _focus={{ 
                      borderColor: "#1976d2",
                      boxShadow: "0 0 0 1px #1976d2"
                    }}
                  />
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    maxW="200px"
                    focusBorderColor="#1976d2"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="passenger">Passenger</option>
                  </Select>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Users Table */}
          <Card bg={cardBg} shadow="xl" borderRadius="lg">
            <CardBody p={8}>
              <Heading size="md" color={textColor} mb={6}>
                Users ({filteredUsers.length})
              </Heading>
              
              {filteredUsers.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  No users found matching your criteria.
                </Alert>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr bg={useColorModeValue("gray.50", "gray.700")}>
                        <Th color={mutedTextColor}>User</Th>
                        <Th color={mutedTextColor}>Contact</Th>
                        <Th color={mutedTextColor}>Details</Th>
                        <Th color={mutedTextColor}>Role</Th>
                        <Th color={mutedTextColor}>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredUsers.map((user) => (
                        <Tr key={user._id} _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar 
                                size="sm" 
                                name={user.name || user.username || 'User'}
                                bg="linear(to-r, #283593, #1976d2)"
                                color="white"
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                  {user.name || user.username || 'No Name'}
                                </Text>
                                <Text fontSize="xs" color={mutedTextColor}>
                                  ID: {user._id.slice(-6)}
                                </Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <HStack spacing={2}>
                                <EmailIcon boxSize={3} color={mutedTextColor} />
                                <Text fontSize="sm" color={textColor}>
                                  {user.email}
                                </Text>
                              </HStack>
                              {user.phone && (
                                <HStack spacing={2}>
                                  <PhoneIcon boxSize={3} color={mutedTextColor} />
                                  <Text fontSize="sm" color={textColor}>
                                    {user.phone}
                                  </Text>
                                </HStack>
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              {user.age && (
                                <Text fontSize="sm" color={textColor}>
                                  Age: {user.age}
                                </Text>
                              )}
                              {user.gender && (
                                <Text fontSize="sm" color={textColor}>
                                  {user.gender}
                                </Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme={getRoleBadgeColor(user.role)}
                              fontSize="xs"
                            >
                              {user.role}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                icon={<EditIcon />}
                                colorScheme="blue"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                aria-label="Edit user"
                              />
                              <IconButton
                                icon={<DeleteIcon />}
                                colorScheme="red"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user._id)}
                                aria-label="Delete user"
                              />
                            </HStack>
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

      {/* Add/Edit User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader 
            bgGradient="linear(to-r, #283593, #1976d2)" 
            color="white" 
            borderTopRadius="md"
          >
            {isEditMode ? 'Edit User' : 'Add New User'}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color={textColor}>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  focusBorderColor="#1976d2"
                  _focus={{ 
                    borderColor: "#1976d2",
                    boxShadow: "0 0 0 1px #1976d2"
                  }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Phone</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  focusBorderColor="#1976d2"
                  _focus={{ 
                    borderColor: "#1976d2",
                    boxShadow: "0 0 0 1px #1976d2"
                  }}
                />
              </FormControl>
              
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel color={textColor}>Age</FormLabel>
                  <NumberInput
                    value={formData.age}
                    onChange={(value) => setFormData({ ...formData, age: value })}
                    min={0}
                    max={120}
                    focusBorderColor="#1976d2"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Gender</FormLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    focusBorderColor="#1976d2"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>
              </HStack>
              
              <FormControl isRequired>
                <FormLabel color={textColor}>Role</FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  focusBorderColor="#1976d2"
                >
                  <option value="passenger">Passenger</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                bgGradient="linear(to-r, #283593, #1976d2)"
                color="white"
                _hover={{ bgGradient: "linear(to-r, #1976d2, #283593)" }}
                onClick={handleSaveUser}
              >
                {isEditMode ? 'Update' : 'Create'} User
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default UserManagement;
