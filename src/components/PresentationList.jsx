import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  List,
  ListItem,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';

function PresentationList({ onJoin, onCreate, nickname }) {
  const [presentations, setPresentations] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const port =
    'http://usermanagement-dev.eba-tems7iqk.eu-west-2.elasticbeanstalk.com/api/';

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        const response = await axios.get(`${port}Presentation`);
        setPresentations(response.data);
      } catch (error) {
        console.error('Error fetching presentations:', error);
      }
    };

    fetchPresentations();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${port}Presentation`, {
        title: newTitle,
        ownerName: nickname,
      });
      setPresentations([...presentations, response.data]);
      onCreate(response.data);
    } catch (error) {
      console.error('Error creating presentation:', error);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box as="form" onSubmit={handleCreate}>
        <HStack justify="space-between" mb={4}>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Create a New Presentation
          </Text>
          <Text fontSize="lg" color="gray.500">
            Logged in as: {nickname}
          </Text>
        </HStack>
        <FormControl id="newTitle" isRequired>
          <FormLabel>Presentation Title:</FormLabel>
          <Input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter presentation title"
          />
        </FormControl>
        <Button type="submit" colorScheme="green" mt={4}>
          Create
        </Button>
      </Box>

      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Existing Presentations
        </Text>
        <List spacing={3}>
          {presentations.map((presentation, index) => (
            <ListItem
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              shadow="md"
            >
              <Text>Presentation: {presentation.title}</Text>
              <Text>Owner: {presentation.ownerName}</Text>
              <Button
                mt={2}
                colorScheme="blue"
                onClick={() => onJoin(presentation)}
              >
                Join
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>
    </VStack>
  );
}

export default PresentationList;
