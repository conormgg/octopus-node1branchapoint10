
import { useEffect, useRef } from 'react';
import Konva from 'konva';

interface UseCurrentToolTrackingProps {
  stageRef: React.RefObject<Konva.Stage>;
}

export const useCurrentToolTracking = (stageRef: React.RefObject<Konva.Stage>) => {
  const currentToolRef = useRef<string>('pencil');

  // Update current tool ref
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const updateTool = () => {
      currentToolRef.current = (stage.getAttr('currentTool') as string) || 'pencil';
    };
    
    // Initial update
    updateTool();
    
    // Listen for attribute changes
    const interval = setInterval(updateTool, 100);
    
    return () => clearInterval(interval);
  }, [stageRef]);

  return { currentToolRef };
};
