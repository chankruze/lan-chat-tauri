import { useState, useEffect, useCallback } from 'react';
import { isWebSocketServerRunning, getWebSocketServerAddress } from '@/services/ws';

export interface WebSocketServerStatus {
  isRunning: boolean;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export function useWebSocketServer() {
  const [status, setStatus] = useState<WebSocketServerStatus>({
    isRunning: false,
    address: null,
    loading: true,
    error: null,
  });

  const checkStatus = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      
      const [isRunning, address] = await Promise.all([
        isWebSocketServerRunning(),
        getWebSocketServerAddress()
      ]);
      
      setStatus({
        isRunning,
        address,
        loading: false,
        error: null,
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, []);

  useEffect(() => {
    checkStatus();
    
    // Poll status every 5 seconds (optional)
    const interval = setInterval(checkStatus, 5000);
    
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    ...status,
    refresh: checkStatus,
  };
}
