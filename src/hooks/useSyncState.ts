
import { useEffect, useRef, useCallback, useState } from 'react';
import { WhiteboardOperation, SyncConfig, SyncState, OperationType } from '@/types/sync';
import { SyncConnectionManager } from '@/utils/sync';
import { createDebugLogger } from '@/utils/debug/debugConfig';

const debugLog = createDebugLogger('sync');

export const useSyncState = (
  config: SyncConfig,
  onReceiveOperation: (operation: WhiteboardOperation) => void
) => {
  const [syncState, setSyncState] = useState<SyncState>({
    isConnected: false,
    isReceiveOnly: config.isReceiveOnly || false,
    lastSyncTimestamp: Date.now(),
    pendingOperations: []
  });

  const pendingOperationsRef = useRef<WhiteboardOperation[]>([]);
  const configRef = useRef(config);
  const handlerRef = useRef(onReceiveOperation);

  // Update refs when dependencies change
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    handlerRef.current = onReceiveOperation;
  }, [onReceiveOperation]);

  // Send operation to other clients using the connection manager
  const sendOperation = useCallback((operation: Omit<WhiteboardOperation, 'id' | 'timestamp' | 'sender_id'>) => {
    if (configRef.current.isReceiveOnly) return null;
    
    debugLog('useSyncState', `Sending operation of type ${operation.operation_type} for whiteboard: ${config.whiteboardId}`);

    const fullOperation = SyncConnectionManager.sendOperation(configRef.current, operation);
    
    if (!fullOperation) {
      debugLog('useSyncState', 'Failed to send operation through connection manager');
      return null;
    }
    
    // Update last sync timestamp
    setSyncState(prev => ({
      ...prev,
      lastSyncTimestamp: Date.now()
    }));
    
    return fullOperation;
  }, [config.whiteboardId]);

  // Register with the connection manager - NOW REACTIVE TO isReceiveOnly CHANGES
  useEffect(() => {
    debugLog('useSyncState', `Registering handler for whiteboard: ${config.whiteboardId}`, { isReceiveOnly: config.isReceiveOnly });
    
    // Create a stable handler reference that always calls the latest handler function
    const stableHandler = (operation: WhiteboardOperation) => {
      debugLog('useSyncState', 'Received operation via connection manager:', operation);
      
      // Update last sync timestamp
      setSyncState(prev => ({
        ...prev,
        lastSyncTimestamp: Date.now()
      }));
      
      // Call the handler
      handlerRef.current(operation);
    };
    
    // Register with the connection manager
    const { isConnected } = SyncConnectionManager.registerHandler(config, stableHandler);
    
    // Update connection state and sync the isReceiveOnly flag
    setSyncState(prev => ({
      ...prev,
      isConnected,
      isReceiveOnly: config.isReceiveOnly || false
    }));
    
    // Set up a periodic check for connection status
    const statusInterval = setInterval(() => {
      const status = SyncConnectionManager.getConnectionStatus(config);
      setSyncState(prev => {
        if (prev.isConnected !== status.isConnected) {
          debugLog('useSyncState', `Connection status changed: ${status.isConnected}`);
          return {
            ...prev,
            isConnected: status.isConnected
          };
        }
        return prev;
      });
    }, 5000);
    
    return () => {
      debugLog('useSyncState', `Unregistering handler for whiteboard: ${config.whiteboardId}`, { isReceiveOnly: config.isReceiveOnly });
      SyncConnectionManager.unregisterHandler(config, stableHandler);
      clearInterval(statusInterval);
    };
  }, [config.whiteboardId, config.sessionId, config.senderId, config.isReceiveOnly]); // CRITICAL: Added config.isReceiveOnly to dependencies

  return {
    syncState,
    sendOperation: configRef.current.isReceiveOnly ? null : sendOperation
  };
};
