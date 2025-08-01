import React from 'react';
import { Group, Rect, Circle, Line } from 'react-konva';
import { SelectionBounds } from '@/types/whiteboard';

interface TransformControlsProps {
  bounds: SelectionBounds;
  isVisible: boolean;
  onHandleMouseDown: (handleType: string, e: any) => void;
  zoom: number;
}

export const TransformControls: React.FC<TransformControlsProps> = ({
  bounds,
  isVisible,
  onHandleMouseDown,
  zoom
}) => {
  if (!isVisible || !bounds) return null;

  // Scale handle size based on zoom level for consistent visual size
  const handleSize = Math.max(8, 12 / zoom);
  const rotationHandleOffset = Math.max(20, 30 / zoom);

  // Calculate handle positions
  const handles = [
    { type: 'nw', x: bounds.x, y: bounds.y },
    { type: 'n', x: bounds.x + bounds.width / 2, y: bounds.y },
    { type: 'ne', x: bounds.x + bounds.width, y: bounds.y },
    { type: 'e', x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    { type: 'se', x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { type: 's', x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    { type: 'sw', x: bounds.x, y: bounds.y + bounds.height },
    { type: 'w', x: bounds.x, y: bounds.y + bounds.height / 2 }
  ];

  // Rotation handle position (above the selection)
  const rotationHandle = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y - rotationHandleOffset
  };

  const getCursor = (handleType: string) => {
    switch (handleType) {
      case 'nw':
      case 'se':
        return 'nw-resize';
      case 'ne':
      case 'sw':
        return 'ne-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'rotate':
        return 'grab';
      default:
        return 'default';
    }
  };

  return (
    <Group listening={false}>
      {/* Selection border */}
      <Rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        fill="transparent"
        stroke="hsl(var(--primary))"
        strokeWidth={1 / zoom}
        dash={[4 / zoom, 4 / zoom]}
        listening={false}
      />

      {/* Resize handles - remove event handlers, they'll be handled at stage level */}
      {handles.map((handle) => (
        <Group key={handle.type}>
          <Rect
            x={handle.x - handleSize / 2}
            y={handle.y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth={1 / zoom}
            listening={false}
          />
        </Group>
      ))}

      {/* Rotation handle line */}
      <Line
        points={[
          bounds.x + bounds.width / 2,
          bounds.y,
          rotationHandle.x,
          rotationHandle.y
        ]}
        stroke="hsl(var(--primary))"
        strokeWidth={1 / zoom}
        listening={false}
      />

      {/* Rotation handle - remove event handlers, they'll be handled at stage level */}
      <Circle
        x={rotationHandle.x}
        y={rotationHandle.y}
        radius={handleSize / 2}
        fill="hsl(var(--background))"
        stroke="hsl(var(--primary))"
        strokeWidth={1 / zoom}
        listening={false}
      />
    </Group>
  );
};