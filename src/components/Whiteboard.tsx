
import React, { useState, useEffect } from 'react';
import WhiteboardCanvas from './WhiteboardCanvas';
import MovableToolbar from './MovableToolbar';
import { PalmRejectionSettings } from './PalmRejectionSettings';
import { useWhiteboardState } from '@/hooks/useWhiteboardState';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface WhiteboardProps {
  isReadOnly?: boolean;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ isReadOnly = false }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const whiteboardState = useWhiteboardState();

  // Palm rejection configuration - enabled by default for better touch isolation
  const [palmRejectionConfig, setPalmRejectionConfig] = useState({
    maxContactSize: 40,
    minPressure: 0.1,
    palmTimeoutMs: 500,
    clusterDistance: 100,
    preferStylus: true,
    enabled: true
  });

  const updateDimensions = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleStrokeWidthChange = (width: number) => {
    whiteboardState.setStrokeWidth(width);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full select-none touch-none drawing-background" 
      style={{ 
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        touchAction: 'none',
        userSelect: 'none',
        pointerEvents: 'auto',
        position: 'relative',
        overflow: 'hidden'
      }}
      data-whiteboard-ui="true"
    >
      {/* Palm Rejection Settings Button */}
      {!isReadOnly && (
        <div className="absolute bottom-2 right-2 z-20 interactive-element" data-ui-interactive="true">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-white/80 backdrop-blur-sm touch-safe interactive-element"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 interactive-element" align="end">
              <PalmRejectionSettings
                config={palmRejectionConfig}
                onChange={setPalmRejectionConfig}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <WhiteboardCanvas
        width={dimensions.width}
        height={dimensions.height}
        whiteboardState={whiteboardState}
        isReadOnly={isReadOnly}
        palmRejectionConfig={palmRejectionConfig}
      />
      
      <div className="pointer-events-auto interactive-element" data-ui-interactive="true">
        <MovableToolbar
          currentTool={whiteboardState.state.currentTool}
          currentStrokeWidth={whiteboardState.state.currentStrokeWidth}
          currentStrokeColor={whiteboardState.state.currentColor}
          pencilSettings={whiteboardState.state.pencilSettings}
          highlighterSettings={whiteboardState.state.highlighterSettings}
          canUndo={whiteboardState.canUndo}
          canRedo={whiteboardState.canRedo}
          onToolChange={whiteboardState.setTool}
          onStrokeWidthChange={handleStrokeWidthChange}
          onStrokeColorChange={whiteboardState.setColor}
          onPencilColorChange={whiteboardState.setPencilColor}
          onHighlighterColorChange={whiteboardState.setHighlighterColor}
          onUndo={whiteboardState.undo}
          onRedo={whiteboardState.redo}
          isReadOnly={isReadOnly}
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
