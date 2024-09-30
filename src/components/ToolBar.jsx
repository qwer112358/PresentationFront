import React, { useState } from 'react';
import { Box, Button, HStack, Input } from '@chakra-ui/react';
import {
  FaPencilAlt,
  FaEraser,
  FaSquare,
  FaCircle,
  FaArrowRight,
} from 'react-icons/fa';

const ToolBar = ({ setTool, setColor }) => {
  const [selectedColor, setSelectedColor] = useState('#000000');

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setSelectedColor(newColor);
    setColor(newColor);
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" shadow="md">
      <HStack spacing={4}>
        <Button colorScheme="teal" onClick={() => setTool('pencil')}>
          <FaPencilAlt style={{ marginRight: '8px' }} />
          Pencil
        </Button>
        <Button colorScheme="orange" onClick={() => setTool('eraser')}>
          <FaEraser style={{ marginRight: '8px' }} />
          Eraser
        </Button>
        <Button colorScheme="blue" onClick={() => setTool('rect')}>
          <FaSquare style={{ marginRight: '8px' }} />
          Rectangle
        </Button>
        <Button colorScheme="purple" onClick={() => setTool('circle')}>
          <FaCircle style={{ marginRight: '8px' }} />
          Circle
        </Button>
        <Button colorScheme="pink" onClick={() => setTool('arrow')}>
          <FaArrowRight style={{ marginRight: '8px' }} />
          Arrow
        </Button>
        <Input
          type="color"
          value={selectedColor}
          onChange={handleColorChange}
          ml={4}
          p={1}
          borderWidth="1px"
          borderRadius="md"
          w="50px"
        />
      </HStack>
    </Box>
  );
};

export default ToolBar;
