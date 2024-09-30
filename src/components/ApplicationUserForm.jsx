import { useState } from 'react';
import axios from 'axios';
import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';

function ApplicationUserForm({ onSubmit }) {
  const [nickname, setNickname] = useState('');
  const port =
    'http://usermanagement-dev.eba-tems7iqk.eu-west-2.elasticbeanstalk.com/api/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${port}ApplicationUser?nickname=${nickname}`,
        { nickname }
      );
      onSubmit(response.data);
    } catch (error) {
      console.error('Error submitting nickname:', error);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      shadow="md"
      maxW="lg"
      mx="auto"
    >
      <FormControl id="nickname" isRequired>
        <FormLabel fontSize="xl">Enter your nickname:</FormLabel>
        <Input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter your nickname"
          size="lg"
          fontSize="xl"
          p={6}
        />
      </FormControl>
      <Button type="submit" colorScheme="teal" mt={4} size="lg" w="full">
        Submit
      </Button>
    </Box>
  );
}

export default ApplicationUserForm;
