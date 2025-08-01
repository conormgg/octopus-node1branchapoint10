import { useCallback } from 'react';
import { LineObject, ImageObject, HistorySnapshot, SelectionState, ActivityMetadata } from '@/types/whiteboard';
import { WhiteboardOperation } from '@/types/sync';
import { serializeUndoOperation, serializeRedoOperation } from '@/utils/operationSerializer';
import { createDebugLogger } from '@/utils/debug/debugConfig';

const debugLog = createDebugLogger('history');

export const useHistoryState = (
  state: {
    history: HistorySnapshot[];
    historyIndex: number;
    lines: LineObject[];
    images: ImageObject[];
    selectionState: SelectionState;
  },
  setState: (updater: (prev: any) => any) => void,
  updateSelectionState?: (selectionState: SelectionState) => void,
  sendOperation?: ((operation: Omit<WhiteboardOperation, 'id' | 'timestamp' | 'sender_id'>) => WhiteboardOperation | null) | null
) => {
  const addToHistory = useCallback((snapshot: HistorySnapshot, activityMetadata?: ActivityMetadata) => {
    setState(prev => {
      // If we're not at the end of the history, truncate it
      const newHistory = prev.historyIndex < prev.history.length - 1
        ? prev.history.slice(0, prev.historyIndex + 1)
        : prev.history;
      
      const newSnapshot = {
        lines: [...snapshot.lines],
        images: [...snapshot.images],
        selectionState: {
          ...snapshot.selectionState,
          selectedObjects: [...snapshot.selectionState.selectedObjects]
        },
        lastActivity: activityMetadata
      };
      
      debugLog('AddToHistory', 'Adding to history with activity', activityMetadata);
      
      return {
        ...prev,
        history: [...newHistory, newSnapshot],
        historyIndex: newHistory.length
      };
    });
  }, [setState]);

  // Get the last activity from the current history - includes persisted activity
  const getLastActivity = useCallback((): ActivityMetadata | undefined => {
    if (state.history.length === 0) return undefined;
    
    // Look through recent history entries for the most recent activity
    for (let i = state.historyIndex; i >= 0; i--) {
      const snapshot = state.history[i];
      if (snapshot.lastActivity) {
        debugLog('GetActivity', `Found last activity at history index ${i}`);
        return snapshot.lastActivity;
      }
    }
    
    debugLog('GetActivity', 'No activity found in history');
    return undefined;
  }, [state.history, state.historyIndex]);

  const validateSelection = useCallback((selectionState: SelectionState, lines: LineObject[], images: ImageObject[]): SelectionState => {
    // Filter out selected objects that no longer exist
    const validSelectedObjects = selectionState.selectedObjects.filter(selectedObj => {
      if (selectedObj.type === 'line') {
        return lines.some(line => line.id === selectedObj.id);
      } else if (selectedObj.type === 'image') {
        return images.some(image => image.id === selectedObj.id);
      }
      return false;
    });

    return {
      ...selectionState,
      selectedObjects: validSelectedObjects,
      // Clear selection bounds if no objects are selected
      selectionBounds: validSelectedObjects.length > 0 ? selectionState.selectionBounds : null,
      // Don't restore isSelecting state from history
      isSelecting: false
    };
  }, []);

  const undo = useCallback(() => {
    // Send sync operation if available (for Teacher1-Student1 pair)
    if (sendOperation) {
      debugLog('Undo', 'Sending undo operation to sync');
      const operation = serializeUndoOperation();
      sendOperation(operation);
    }

    setState(prev => {
      if (prev.historyIndex <= 0) return prev;
      
      const newIndex = prev.historyIndex - 1;
      const snapshot = prev.history[newIndex];
      
      // Validate selection state against the restored objects
      const validatedSelectionState = validateSelection(snapshot.selectionState, snapshot.lines, snapshot.images);
      
      // Update the selection hook if provided
      if (updateSelectionState) {
        setTimeout(() => updateSelectionState(validatedSelectionState), 0);
      }
      
      debugLog('Undo', `Applied undo: index ${prev.historyIndex} -> ${newIndex}`, {
        linesCount: snapshot.lines.length,
        imagesCount: snapshot.images.length
      });
      
      return {
        ...prev,
        lines: [...snapshot.lines],
        images: [...snapshot.images],
        selectionState: validatedSelectionState,
        historyIndex: newIndex
      };
    });
  }, [setState, validateSelection, updateSelectionState, sendOperation]);

  const redo = useCallback(() => {
    // Send sync operation if available (for Teacher1-Student1 pair)
    if (sendOperation) {
      debugLog('Redo', 'Sending redo operation to sync');
      const operation = serializeRedoOperation();
      sendOperation(operation);
    }

    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      
      const newIndex = prev.historyIndex + 1;
      const snapshot = prev.history[newIndex];
      
      // Validate selection state against the restored objects
      const validatedSelectionState = validateSelection(snapshot.selectionState, snapshot.lines, snapshot.images);
      
      // Update the selection hook if provided
      if (updateSelectionState) {
        setTimeout(() => updateSelectionState(validatedSelectionState), 0);
      }
      
      debugLog('Redo', `Applied redo: index ${prev.historyIndex} -> ${newIndex}`, {
        linesCount: snapshot.lines.length,
        imagesCount: snapshot.images.length
      });
      
      return {
        ...prev,
        lines: [...snapshot.lines],
        images: [...snapshot.images],
        selectionState: validatedSelectionState,
        historyIndex: newIndex
      };
    });
  }, [setState, validateSelection, updateSelectionState, sendOperation]);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    getLastActivity
  };
};
