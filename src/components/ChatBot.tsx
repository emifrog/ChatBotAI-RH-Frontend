'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  Calendar, 
  FileText, 
  Users, 
  HelpCircle, 
  Minimize2, 
  Maximize2, 
  AlertCircle, 
  CheckCircle, 
  ThumbsUp, 
  ThumbsDown, 
  X 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useAntibia } from '../../hooks/useAntibia';

// Interface pour les actions rapides
interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  params?: any;
}

// Interface pour les messages
interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  intent?: string;
  actions?: QuickAction[];
  metadata?: any;
}

// Composant de connexion
const LoginForm: React.FC<{ onLogin: (credentials: any) => Promise<void>; loading: boolean; error: string | null }> = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin({ email, password });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <Bot className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Assistant RH</h2>
        <p className="text-gray-600 text-sm">Connectez-vous pour accéder à vos données RH</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="votre.email@entreprise.com"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
            required
          />
        </div>
        
        {error && (
          <div className="text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>
    </div>
  );
};

// Composant principal ChatBot
const ChatBot: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: 'up' | 'down' }>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hooks personnalisés
  const auth = useAuth();
  const socket = useSocket(auth.token, 'default-conversation');
  const antibia = useAntibia(auth.token);

  // Auto scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [socket.messages]);

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  const handleSendMessage = () => {
    if (!inputText.trim() || socket.isLoading) return;
    socket.sendMessage(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string, params?: any) => {
    socket.executeAction(action, params);
  };

  const handleFeedback = (messageId: string, type: 'up' | 'down') => {
    setFeedbacks(prev => ({
      ...prev,
      [messageId]: type
    }));
    
    // Envoyer le feedback au backend (optionnel)
    console.log(`Feedback ${type} pour message ${messageId}`);
  };

  const getIconComponent = (iconName: string, className = "w-4 h-4") => {
    const icons: { [key: string]: React.ComponentType<{ className?: string }> } = {
      calendar: Calendar,
      'file-text': FileText,
      users: Users,
      'help-circle': HelpCircle
    };
    const IconComponent = icons[iconName] || HelpCircle;
    return <IconComponent className={className} />;
  };

  const getStatusIcon = () => {
    if (!socket.isConnected) return <AlertCircle className="w-3 h-3 text-red-500" />;
    if (socket.isLoading) return <div className="w-3 h-3 border border-yellow-500 border-t-transparent rounded-full animate-spin" />;
    return <CheckCircle className="w-3 h-3 text-green-500" />;
  };

  // Rendu pour utilisateur non authentifié
  if (!auth.isAuthenticated) {
    if (isMinimized) {
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsMinimized(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Bot className="w-6 h-6" />
          <span className="hidden sm:inline">Assistant RH</span>
          {!socket.isConnected && (
            <AlertCircle className="w-4 h-4 text-red-300" />
          )}
        </button>
      </div>
    );
  }

// Rendu principal
return (
  <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
    {/* Header avec statut de connexion */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Bot className="w-6 h-6" />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Assistant RH</h3>
            {getStatusIcon()}
          </div>
          <p className="text-xs opacity-90">
            {auth.user?.name} • {socket.isConnected ? 'Connecté' : 'Déconnecté'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs opacity-75">
          Antibia {antibia.loading ? 'sync...' : 'OK'}
        </div>
        <button
          onClick={auth.logout}
          className="hover:bg-blue-800 p-1 rounded transition-colors"
          title="Déconnexion"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsMinimized(true)}
          className="hover:bg-blue-800 p-1 rounded transition-colors"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {socket.messages.map((message) => (
        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
            <div className={`flex items-start gap-2 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-blue-600' : 'bg-gray-200'
              }`}>
                {message.type === 'user' ? 
                  <User className="w-4 h-4 text-white" /> : 
                  <Bot className="w-4 h-4 text-gray-600" />
                }
              </div>
              <div className={`rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}>
                <div className="text-sm whitespace-pre-line">{message.content}</div>
                <div className={`text-xs mt-1 flex items-center justify-between ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span>
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {/* Feedback buttons pour les messages bot */}
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleFeedback(message.id, 'up')}
                        className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                          feedbacks[message.id] === 'up' ? 'text-green-600 bg-green-50' : 'text-gray-400'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, 'down')}
                        className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                          feedbacks[message.id] === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-400'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            {message.actions && message.actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.action, action.params)}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm shadow-sm"
                  >
                    {getIconComponent(action.icon)}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Loading indicator */}
      {socket.isLoading && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-500">Consultation Antibia...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {socket.error && (
        <div className="flex justify-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {socket.error}
            <button
              onClick={() => window.location.reload()}
              className="ml-2 text-xs underline"
            >
              Actualiser
            </button>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>

    {/* Shortcuts bar avec données Antibia */}
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>📅 Congés: {antibia.leaveBalance?.paidLeave || 0}j</span>
          <span>🎓 Formations: {antibia.trainings.length || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span>{socket.isConnected ? 'En ligne' : 'Hors ligne'}</span>
        </div>
      </div>
    </div>

    {/* Input */}
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tapez votre message ou question RH..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          disabled={socket.isLoading || !socket.isConnected}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim() || socket.isLoading || !socket.isConnected}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      
      {/* Quick suggestions */}
      <div className="mt-2 flex flex-wrap gap-1">
        {['Mes congés', 'Ma paie', 'Formations', 'Contact RH'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setInputText(suggestion)}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
            disabled={socket.isLoading}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>

    {/* Connection status indicator */}
    {!socket.isConnected && (
      <div className="absolute top-16 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Connexion interrompue. Tentative de reconnexion...
      </div>
    )}
  </div>
);
};
}

export default ChatBot;