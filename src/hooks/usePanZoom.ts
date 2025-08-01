
import { useMemo } from 'react';
import { PanZoomState } from '@/types/whiteboard';
import { usePanZoomCore } from './panZoom/usePanZoomCore';
import { usePanState } from './panZoom/usePanState';
import { useTouchHandlers } from './panZoom/useTouchHandlers';

export const usePanZoom = (
  panZoomState: PanZoomState,
  setPanZoomState: (state: PanZoomState) => void,
  currentTool?: string
) => {
  // Core zoom and centering functionality
  const { zoom, handleWheel, centerOnBounds } = usePanZoomCore(panZoomState, setPanZoomState);
  
  // Pan state management
  const panHandlers = usePanState(panZoomState, setPanZoomState);
  
  // Touch event handlers with current tool awareness (Phase 1 implementation)
  const touchHandlers = useTouchHandlers(panHandlers, zoom, currentTool);

  // Wrap the return object in useMemo to stabilize its reference
  return useMemo(() => ({
    startPan: panHandlers.startPan,
    continuePan: panHandlers.continuePan,
    stopPan: panHandlers.stopPan,
    zoom,
    handleWheel,
    handleTouchStart: touchHandlers.handleTouchStart,
    handleTouchMove: touchHandlers.handleTouchMove,
    handleTouchEnd: touchHandlers.handleTouchEnd,
    isGestureActive: panHandlers.isGestureActive,
    centerOnBounds
  }), [
    panHandlers.startPan,
    panHandlers.continuePan,
    panHandlers.stopPan,
    zoom,
    handleWheel,
    touchHandlers.handleTouchStart,
    touchHandlers.handleTouchMove,
    touchHandlers.handleTouchEnd,
    panHandlers.isGestureActive,
    centerOnBounds
  ]);
};
