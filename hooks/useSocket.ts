import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  intent?: string;
  actions?: QuickAction[];
  metadata?: any;
}

interface QuickAction {
  id: string;
  label: string;
  action: string;
  params?: any;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  sendMessage: (message: string) => void;
  executeAction: (action: string, params?: any) => void;
  isLoading: boolean;
  error: string | null;
  clearMessages: () => void;
}

export const useSocket = (token: string | null, conversationId: string = 'default'): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialisation Socket.IO avec vraie connexion backend
  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.close();
        setSocket(null);
        setIsConnected(false);
        setMessages([]);
      }
      return;
    }

    console.log('🔌 Connexion Socket.IO au backend...');
    
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      retries: 3,
      autoConnect: true
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Événements de connexion
    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('✅ Socket.IO connecté - ID:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('❌ Socket.IO déconnecté:', reason);
      
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (err) => {
      setError(`Erreur connexion: ${err.message}`);
      setIsConnected(false);
      console.error('❌ Erreur Socket.IO:', err);
    });

    // Événements du chat
    newSocket.on('bot_response', (data: any) => {
      console.log('📨 Réponse bot reçue:', data);
      
      const botMessage: Message = {
        id: data.id || Date.now().toString(),
        type: 'bot',
        content: data.content,
        timestamp: new Date(data.timestamp),
        intent: data.intent,
        actions: data.actions || [],
        metadata: data.metadata
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    });

    newSocket.on('action_result', (data: any) => {
      console.log('⚡ Résultat action reçu:', data);
      
      const resultMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: data.message || `✅ Action ${data.action} effectuée`,
        timestamp: new Date(),
        metadata: { action: data.action, result: data.result }
      };
      
      setMessages(prev => [...prev, resultMessage]);
      setIsLoading(false);
    });

    newSocket.on('error', (errorData: any) => {
      console.error('❌ Erreur Socket:', errorData);
      setError(errorData.message || 'Erreur du serveur');
      setIsLoading(false);
    });

    newSocket.on('action_error', (data: any) => {
      console.error('❌ Erreur action:', data);
      setError(`Erreur ${data.action}: ${data.error}`);
      setIsLoading(false);
    });

    return () => {
      console.log('🔌 Fermeture Socket.IO');
      newSocket.close();
    };
  }, [token]);

  const sendMessage = useCallback((message: string) => {
    if (!socket || !isConnected || !message.trim()) {
      setError('Impossible d\'envoyer le message');
      return;
    }

    console.log('📤 Envoi message:', message);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    socket.emit('send_message', {
      message: message.trim(),
      conversationId,
      timestamp: new Date().toISOString()
    });
  }, [socket, isConnected, conversationId]);

  const executeAction = useCallback((action: string, params?: any) => {
    if (!socket || !isConnected) {
      setError('Non connecté au serveur');
      return;
    }

    console.log('⚡ Exécution action:', action, params);
    
    setIsLoading(true);
    setError(null);

    socket.emit('quick_action', {
      action,
      params: params || {},
      conversationId
    });
  }, [socket, isConnected, conversationId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    socket,
    isConnected,
    messages,
    sendMessage,
    executeAction,
    isLoading,
    error,
    clearMessages
  };
};