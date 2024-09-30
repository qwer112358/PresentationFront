import { Stage, Layer, Rect } from 'react-konva';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ToolBar from './ToolBar';
import Shapes from './Shapes';
import drawingService from '../services/drawingService';
import signalRService from '../services/signalRService';
import lineService from '../services/lineService';
import { Box } from '@chakra-ui/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SlidePanel from './SlidePanel';

function Whiteboard({
  presentationId,
  slides,
  onSlideAdded,
  initialUsers,
  connection,
}) {
  const port =
    'https://backendpresentation.onrender.com/api/';
  const [selectedTool, setSelectedTool] = useState('pencil');
  const [currentSlide, setCurrentSlide] = useState(slides[0]);
  const [drawingData, setDrawingData] = useState([]);
  const stageRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [color, setColor] = useState('#000000');
  const [currentShape, setCurrentShape] = useState(null);
  const [users, setUsers] = useState(initialUsers || []);

  useEffect(() => {
    if (connection) {
      signalRService.onLoadPreviousDrawings((savedLines) => {
        drawingService.addExternalDraw(
          savedLines.map((line) => ({
            points: JSON.parse(line.points),
            stroke: line.stroke || 'black',
          }))
        );
        setLines([...drawingService.getLines()]);
      });

      signalRService.onReceiveDrawAction((user, newLines) => {
        drawingService.addExternalDraw(newLines);
        setLines([...drawingService.getLines()]);
      });

      connection.on('UserJoined', (nickname) => {
        setUsers((prevUsers) => [...prevUsers, { nickname }]);
        console.log(`${nickname} has joined the presentation.`);
      });

      signalRService.startConnection(presentationId, currentSlide.id);
    }

    return () => {
      if (connection) {
        connection.off('ReceiveSlide');
        connection.off('ReceiveDrawing');
        connection.off('UserJoined');
      }
    };
  }, [connection, currentSlide.id]);

  const handleAddSlide = async () => {
    try {
      const response = await axios.post(`${port}Slide/${presentationId}`, {});
      const newSlide = response.data;

      /*if (connection) {
        await connection.invoke('BroadcastSlide', presentationId, newSlide);
      }*/

      onSlideAdded(newSlide);
    } catch (error) {
      console.error('Error adding slide:', error);
    }
  };

  const handleMouseDown = () => {
    const pos = stageRef.current.getPointerPosition();
    if (selectedTool === 'pencil') {
      drawingService.startDrawing(pos, color);
    } else if (selectedTool === 'eraser') {
      drawingService.startDrawing(pos, 'white', 20);
    } else if (['rect', 'circle', 'arrow'].includes(selectedTool)) {
      drawingService.startShapeDrawing(selectedTool, pos.x, pos.y, color);
    }
  };

  const handleMouseMove = () => {
    const pos = stageRef.current.getPointerPosition();

    if (drawingService.isDrawing) {
      if (['pencil', 'eraser'].includes(selectedTool)) {
        drawingService.continueDrawing(pos);
      } else if (['rect', 'circle', 'arrow'].includes(selectedTool)) {
        drawingService.continueShapeDrawing(pos.x, pos.y);
      }
      setLines([...drawingService.getLines()]);
    }

    if (
      ['rect', 'circle', 'arrow'].includes(selectedTool) &&
      drawingService.currentShape
    ) {
      setCurrentShape({ ...drawingService.currentShape });
    }
  };

  const handleMouseUp = () => {
    const pos = stageRef.current.getPointerPosition();

    if (['pencil', 'eraser'].includes(selectedTool)) {
      const newLine = drawingService.endDrawing();
      setLines([...drawingService.getLines()]);
      if (connection) {
        signalRService.sendDrawAction('user1', [newLine]);
      }
      lineService.saveLine(newLine, currentSlide.id);
    } else if (['rect', 'circle', 'arrow'].includes(selectedTool)) {
      const shape = drawingService.endShapeDrawing();
      setLines([...lines, shape]);
      if (connection) {
        signalRService.sendDrawAction('user1', [shape]);
      }

      const shapeToSave = {
        id: 0,
        points: null,
        stroke: shape.stroke,
        tool: shape.tool,
        startX: Number(shape.startX),
        startY: Number(shape.startY),
        endX: Number(shape.endX),
        endY: Number(shape.endY),
      };

      lineService.saveLine(shapeToSave, currentSlide.id).catch((err) => {
        console.error('Error saving data to DB: ', err);
      });
    }
  };

  return (
    <Box
      className="whiteboard-container"
      display="flex"
      flexDirection="column"
      alignItems="center"
      height="85vh"
    >
      <Box w="full" mb={4}>
        <ToolBar setTool={setSelectedTool} setColor={setColor} />
      </Box>
      <Box display="flex" w="full" flex="1">
        <SlidePanel
          slides={slides}
          setCurrentSlide={setCurrentSlide}
          handleAddSlide={handleAddSlide}
          flex="0 0 200px"
        />
        <Box className="whiteboard" flex="1" display="flex">
          <Stage
            width={800}
            height={700}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            ref={stageRef}
            style={{ border: '1px solid black', flex: '1' }}
          >
            <Layer>
              <Rect width={1366} height={768} fill="white" />
              {drawingData.map((data, index) => (
                <Rect key={index} {...data} />
              ))}
              <Shapes lines={lines} currentShape={currentShape} />
            </Layer>
          </Stage>
        </Box>
        <Box
          className="users-panel"
          w="200px"
          p={4}
          bg="gray.100"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.300"
        >
          <h5>Connected Users</h5>
          <ul>
            {users.map((user, index) => (
              <li key={index}>{user.nickname}</li>
            ))}
          </ul>
        </Box>
      </Box>
    </Box>
  );
}

export default Whiteboard;
