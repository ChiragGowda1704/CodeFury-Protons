// Interactive drawing game with AI guidance

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Palette, 
  Eraser, 
  RotateCcw, 
  Download, 
  Play,
  Pause,
  SkipForward,
  Trophy,
  Star
} from 'lucide-react';
import { toast } from 'react-toastify';

const GameContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-bottom: 3rem;
  font-size: 1.125rem;
`;

const GameCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const GameInfo = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const InfoItem = styled.div`
  text-align: center;
`;

const InfoLabel = styled.div`
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
`;

const GameControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  background: ${props => props.variant === 'primary' ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    props.variant === 'success' ? 
    'linear-gradient(135deg, #28a745 0%, #20c997 100%)' :
    'rgba(102, 126, 234, 0.1)'
  };
  color: ${props => props.variant === 'primary' || props.variant === 'success' ? 'white' : '#667eea'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const GameArea = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ToolPanel = styled.div`
  background: rgba(248, 249, 250, 0.8);
  border-radius: 15px;
  padding: 1.5rem;
`;

const ToolSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ToolTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const ColorPalette = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
`;

const ColorButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 3px solid ${props => props.selected ? '#333' : 'transparent'};
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const BrushSize = styled.input`
  width: 100%;
  margin: 0.5rem 0;
`;

const BrushPreview = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: ${props => props.color};
  margin: 1rem auto;
  border: 2px solid #ddd;
`;

const CanvasContainer = styled.div`
  position: relative;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
`;

const Canvas = styled.canvas`
  display: block;
  cursor: ${props => props.tool === 'eraser' ? 'crosshair' : 'crosshair'};
`;

const GuidancePanel = styled.div`
  background: rgba(102, 126, 234, 0.05);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
`;

const CurrentPrompt = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProgressBar = styled.div`
  background: #e9ecef;
  border-radius: 10px;
  height: 8px;
  margin: 1rem 0;
  overflow: hidden;
`;

const Progress = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
`;

const ScoreDisplay = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
`;

const ScoreItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
  font-weight: 600;
`;

const GameDraw = ({ user }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [gameActive, setGameActive] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameProgress, setGameProgress] = useState(0);

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00',
    '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
    '#808080', '#000080', '#008000', '#800000'
  ];

  const prompts = [
    'Draw a simple house with a triangular roof',
    'Draw a tree with branches and leaves',
    'Draw a smiling sun with rays',
    'Draw a car with wheels',
    'Draw a flower with petals',
    'Draw a mountain with a peak',
    'Draw a boat on water',
    'Draw a bird flying',
    'Draw a butterfly with wings',
    'Draw a fish swimming'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        setGameProgress(((60 - timeLeft) / 60) * 100);
      }, 1000);
    } else if (timeLeft === 0) {
      endRound();
    }
    return () => clearTimeout(timer);
  }, [gameActive, timeLeft]);

  const startGame = () => {
    setGameActive(true);
    setTimeLeft(60);
    setGameProgress(0);
    setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    clearCanvas();
    toast.success('Game started! Follow the prompt and draw!');
  };

  const pauseGame = () => {
    setGameActive(false);
    toast.info('Game paused');
  };

  const endRound = () => {
    setGameActive(false);
    const roundScore = Math.floor(Math.random() * 50) + 30; // Mock scoring
    setScore(score + roundScore);
    toast.success(`Round completed! You scored ${roundScore} points!`);
  };

  const nextPrompt = () => {
    if (gameActive) {
      endRound();
      setTimeout(() => {
        setLevel(level + 1);
        setTimeLeft(60);
        setGameProgress(0);
        setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
        clearCanvas();
        setGameActive(true);
      }, 1000);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `my-drawing-level-${level}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Drawing downloaded!');
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    
    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    }
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <GameContainer>
      <Title>AI Drawing Game</Title>
      <Subtitle>Follow the AI prompts and improve your drawing skills!</Subtitle>

      <GameCard>
        <GameHeader>
          <GameInfo>
            <InfoItem>
              <InfoLabel>Level</InfoLabel>
              <InfoValue>{level}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Score</InfoLabel>
              <InfoValue>{score}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Time Left</InfoLabel>
              <InfoValue>{timeLeft}s</InfoValue>
            </InfoItem>
          </GameInfo>

          <GameControls>
            {!gameActive ? (
              <ControlButton variant="primary" onClick={startGame}>
                <Play size={16} />
                Start Game
              </ControlButton>
            ) : (
              <ControlButton onClick={pauseGame}>
                <Pause size={16} />
                Pause
              </ControlButton>
            )}
            
            <ControlButton onClick={nextPrompt} disabled={!gameActive}>
              <SkipForward size={16} />
              Next Prompt
            </ControlButton>

            <ControlButton onClick={clearCanvas}>
              <RotateCcw size={16} />
              Clear
            </ControlButton>

            <ControlButton variant="success" onClick={downloadDrawing}>
              <Download size={16} />
              Download
            </ControlButton>
          </GameControls>
        </GameHeader>

        <GameArea>
          <ToolPanel>
            <ToolSection>
              <ToolTitle>Tools</ToolTitle>
              <GameControls>
                <ControlButton 
                  variant={tool === 'brush' ? 'primary' : 'default'}
                  onClick={() => setTool('brush')}
                >
                  <Palette size={16} />
                  Brush
                </ControlButton>
                <ControlButton 
                  variant={tool === 'eraser' ? 'primary' : 'default'}
                  onClick={() => setTool('eraser')}
                >
                  <Eraser size={16} />
                  Eraser
                </ControlButton>
              </GameControls>
            </ToolSection>

            <ToolSection>
              <ToolTitle>Colors</ToolTitle>
              <ColorPalette>
                {colors.map((c, index) => (
                  <ColorButton
                    key={index}
                    color={c}
                    selected={color === c}
                    onClick={() => setColor(c)}
                  />
                ))}
              </ColorPalette>
            </ToolSection>

            <ToolSection>
              <ToolTitle>Brush Size: {brushSize}px</ToolTitle>
              <BrushSize
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(e.target.value)}
              />
              <BrushPreview size={brushSize} color={color} />
            </ToolSection>
          </ToolPanel>

          <CanvasContainer>
            <Canvas
              ref={canvasRef}
              width={600}
              height={400}
              tool={tool}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </CanvasContainer>
        </GameArea>

        <GuidancePanel>
          <CurrentPrompt>
            {currentPrompt || 'Click "Start Game" to begin drawing!'}
          </CurrentPrompt>
          
          {gameActive && (
            <ProgressBar>
              <Progress progress={gameProgress} />
            </ProgressBar>
          )}

          <ScoreDisplay>
            <ScoreItem>
              <Trophy size={20} style={{ color: '#FFD700' }} />
              Total Score: {score}
            </ScoreItem>
            <ScoreItem>
              <Star size={20} style={{ color: '#667eea' }} />
              Level: {level}
            </ScoreItem>
          </ScoreDisplay>
        </GuidancePanel>
      </GameCard>
    </GameContainer>
  );
};

export default GameDraw;
