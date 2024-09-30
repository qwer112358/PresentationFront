import { HStack, Heading, Spacer, Text, Button } from '@chakra-ui/react';

const WhiteboardHeader = ({ title, nickname, onLeave }) => {
  return (
    <HStack>
      <Heading size="lg" color="teal.500">
        Presentation {title}
      </Heading>
      <Spacer />
      <Text fontSize="lg" color="gray.500" mr={4}>
        Logged in as: {nickname}
      </Text>
      <Button colorScheme="red" onClick={onLeave} size="md">
        Leave Presentation
      </Button>
    </HStack>
  );
};

export default WhiteboardHeader;
