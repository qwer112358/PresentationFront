import { useState, useEffect } from 'react';
import { ChakraProvider, Box, VStack, Center } from '@chakra-ui/react';
import ApplicationUserForm from './components/ApplicationUserForm';
import PresentationList from './components/PresentationList';
import Whiteboard from './components/Whiteboard';
import WhiteboardHeader from './components/WhiteboardHeader';
import * as signalR from '@microsoft/signalr';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [nickname, setNickname] = useState('');
  const [currentPresentation, setCurrentPresentation] = useState(null);
  const [connection, setConnection] = useState(null);
  const port =
    'https://backendpresentation.onrender.com/';

  useEffect(() => {
    if (nickname) {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${port}whiteboardHub`)
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);
    }
  }, [nickname]);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('Connected to SignalR hub');
        })
        .catch((error) => console.error('SignalR connection error:', error));

      connection.on('UserJoined', (nickname) => {
        console.log(`${nickname} has joined the presentation.`);
      });

      connection.on('UserLeft', (nickname) => {
        console.log(`${nickname} has left the presentation.`);
      });

      connection.on('ReceiveDrawing', (drawingData) => {
        console.log('Received drawing data:', drawingData);
      });
    }
  }, [connection]);

  const handleUserSubmit = (userData) => {
    setNickname(userData.nickname);
  };

  const handleJoinPresentation = async (presentation) => {
    if (connection) {
      await connection.invoke('JoinPresentation', presentation.id, nickname);
      console.log(presentation);
      console.log(nickname);
      setCurrentPresentation(presentation);
    }
  };

  const handleLeavePresentation = async () => {
    if (connection && currentPresentation) {
      await connection.invoke(
        'LeavePresentation',
        currentPresentation.id,
        nickname
      );
      setCurrentPresentation(null);
    }
  };

  const handleCreatePresentation = (presentation) => {
    setCurrentPresentation(presentation);
  };

  const handleAddSlide = (newSlide) => {
    setCurrentPresentation((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
  };

  return (
    <ChakraProvider>
      {!nickname ? (
        <Center height="100vh">
          <VStack spacing={6} textAlign="center">
            <ApplicationUserForm onSubmit={handleUserSubmit} />
          </VStack>
        </Center>
      ) : !currentPresentation ? (
        <Box className="container mt-5">
          <PresentationList
            onJoin={handleJoinPresentation}
            onCreate={handleCreatePresentation}
            nickname={nickname}
          />
        </Box>
      ) : (
        <Box className="container mt-5">
          <VStack spacing={8} align="stretch">
            <WhiteboardHeader
              title={currentPresentation.title}
              nickname={nickname}
              onLeave={handleLeavePresentation}
            />
            <Box borderWidth="1px" borderRadius="lg" p={6} shadow="md" flex="1">
              <Whiteboard
                presentationId={currentPresentation.id}
                slides={currentPresentation.slides}
                onSlideAdded={handleAddSlide}
                initialUsers={[{ nickname: nickname }]}
                connection={connection}
              />
            </Box>
          </VStack>
        </Box>
      )}
    </ChakraProvider>
  );
}

export default App;
