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
  icon: string;
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

  // Initialisation Socket.IO
  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.close();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL n\'est pas défini');
      setError('Configuration serveur manquante');
      return;
    }

    const newSocket = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      retries: 3
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Événements de connexion
    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('✅ Connecté au serveur chatbot');
      
      // Message de bienvenue
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Bonjour ! Je suis votre assistant RH connecté à Antibia. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date(),
        actions: [
          { id: '1', label: 'Mes congés', icon: 'calendar', action: 'view_leaves' },
          { id: '2', label: 'Ma paie', icon: 'file-text', action: 'view_payslip' },
          { id: '3', label: 'Formations', icon: 'users', action: 'view_trainings' },
          { id: '4', label: 'Aide', icon: 'help-circle', action: 'help' }
        ]
      };
      setMessages([welcomeMessage]);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('❌ Déconnecté du serveur:', reason);
      
      if (reason === 'io server disconnect') {
        // Reconnexion automatique si déconnecté par le serveur
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (err) => {
      setError(`Erreur de connexion: ${err.message}`);
      setIsConnected(false);
      console.error('Erreur connexion Socket.IO:', err);
    });

    // Gestion des messages du bot
    newSocket.on('bot_response', (data: { id?: string; content: string; timestamp: string; intent?: string; actions?: QuickAction[]; metadata?: any }) => {
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

    // Résultats d'actions
    newSocket.on('action_result', (data: { action: string; result: any; message?: string }) => {
      const { action, result, message } = data;
      
      const resultMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: message || getActionResultMessage(action, result),
        timestamp: new Date(),
        metadata: { action, result }
      };
      
      setMessages(prev => [...prev, resultMessage]);
      setIsLoading(false);
    });

    // Gestion des erreurs
    newSocket.on('error', (errorData: { message?: string }) => {
      setError(errorData.message || 'Une erreur est survenue');
      setIsLoading(false);
    });

    newSocket.on('action_error', (data: { error: string }) => {
      setError(`Erreur lors de l'action: ${data.error}`);
      setIsLoading(false);
    });

    return () => {
      newSocket.close();
    };
  }, [token]);

  // Envoyer un message
  const sendMessage = useCallback((message: string) => {
    if (!socket || !isConnected || !message.trim()) {
      setError('Impossible d\'envoyer le message');
      return;
    }

    // Ajouter le message utilisateur immédiatement
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Envoyer au serveur
    socket.emit('send_message', {
      message: message.trim(),
      conversationId,
      timestamp: new Date().toISOString()
    });
  }, [socket, isConnected, conversationId]);

  // Exécuter une action rapide
  const executeAction = useCallback((action: string, params?: any) => {
    if (!socket || !isConnected) {
      setError('Non connecté au serveur');
      return;
    }

    setIsLoading(true);
    setError(null);

    socket.emit('quick_action', {
      action,
      params: params || {},
      conversationId
    });
  }, [socket, isConnected, conversationId]);

  // Vider les messages
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

// Fonction utilitaire pour les messages de résultat d'action
function getActionResultMessage(action: string, result: any): string {
  switch (action) {
    case 'view_leaves':
      return `📅 **Vos congés:**\n• Congés payés: ${result.paidLeave || 0} jours\n• RTT: ${result.rtt || 0} jours`;
    case 'view_payslip':
      return `💰 **Votre paie:**\n• Dernier bulletin: ${result.period || 'N/A'}\n• Salaire net: ${result.netSalary || 'N/A'}€`;
    case 'view_trainings':
      return `🎓 **Formations disponibles:**\n${result.trainings?.map((t: any) => `• ${t.title}`).join('\n') || 'Aucune formation disponible'}`;
    default:
      return '✅ Action effectuée avec succès !';
  }
}