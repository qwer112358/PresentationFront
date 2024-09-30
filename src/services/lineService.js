class LineService {
  async saveLine(line, slideId) {
    const lineToSave = {
      id: 0,
      points: line.points ? JSON.stringify(line.points) : null,
      stroke: line.stroke || 'black',
      tool: line.tool || 'line',
      startX: line.startX || 0,
      startY: line.startY || 0,
      endX: line.endX || 0,
      endY: line.endY || 0,
      slideId: slideId,
    };

    try {
      const response = await fetch(
        'https://backendpresentation.onrender.com/api/whiteboard',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([lineToSave]),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save line to database');
      }
    } catch (err) {
      console.error('Error saving data to DB: ', err);
    }
  }
}

const lineService = new LineService();
export default lineService;
