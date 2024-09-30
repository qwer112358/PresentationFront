import { Button, VStack } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useEffect, useCallback } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const ItemType = {
  SLIDE: 'slide',
};

const DraggableSlide = ({ slide, index, moveSlide, setCurrentSlide }) => {
  const [, ref] = useDrag({
    type: ItemType.SLIDE,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType.SLIDE,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveSlide(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))}>
      <Button
        onClick={() => setCurrentSlide(slide)}
        colorScheme="teal"
        variant="outline"
      >
        Slide {index + 1}
      </Button>
    </div>
  );
};

const SlidePanel = ({ slides, setSlides, setCurrentSlide, handleAddSlide }) => {
  const moveSlide = useCallback(
    (dragIndex, hoverIndex) => {
      const updatedSlides = [...slides];
      const [removed] = updatedSlides.splice(dragIndex, 1);
      updatedSlides.splice(hoverIndex, 0, removed);
      setSlides(updatedSlides);

      connection.invoke('UpdateSlides', updatedSlides);
    },
    [slides, setSlides]
  );

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('https://backendpresentation.onrender.com/hubs/presentation')
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log('SignalR connected');
      })
      .catch((err) => console.error('Connection error:', err));

    // Receiving updated slides in real-time
    connection.on('ReceiveSlides', (updatedSlides) => {
      setSlides(updatedSlides);
    });

    return () => {
      connection.stop();
    };
  }, [setSlides]);

  return (
    <DndProvider backend={HTML5Backend}>
      <VStack
        spacing={4}
        bg="gray.100"
        p={4}
        w="200px"
        mr={4}
        borderRadius="md"
        border="1px solid"
        borderColor="gray.300"
      >
        {slides.map((slide, index) => (
          <DraggableSlide
            key={index}
            index={index}
            slide={slide}
            moveSlide={moveSlide}
            setCurrentSlide={setCurrentSlide}
          />
        ))}
        <Button onClick={handleAddSlide} colorScheme="green">
          <FaPlus style={{ marginRight: '8px' }} />
          Add Slide
        </Button>
      </VStack>
    </DndProvider>
  );
};

export default SlidePanel;
