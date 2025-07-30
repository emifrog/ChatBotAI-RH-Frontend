import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Bot, Minimize2, Settings, X, 
  CheckCircle, AlertCircle, WifiOff 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useLeaves } from '../../hooks/useLeaves';

// Composant de connexion
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('marie.dubois@company.com'); // Demo
  const [password, setPassword] = useState('password123'); // Demo
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.login(email, password);
    } catch (error) {
      console.error('Erreur connexion:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
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
            required
          />
        </div>
        
        {auth.error && (
          <div className="text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {auth.error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={auth.loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {auth.loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Compte démo pré-rempli pour les tests
        </p>
      </form>
    </div>
  );
};

// Composant principal du chatbot intégré
export const ChatBotIntegrated: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const auth = useAuth();
  const socket = useSocket(auth.token, 'main-conversation');
  const leaves = useLeaves();

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [socket.messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || socket.isLoading) return;
    socket.sendMessage(inputText);
    setInputText('');
  };

  const handleQuickAction = (action: string, params?: any) => {
    socket.executeAction(action, params);
  };

  const getConnectionStatus = () => {
    if (!auth.isAuthenticated) return { icon: AlertCircle, color: 'text-yellow-500', text: 'Non connecté' };
    if (!socket.isConnected) return { icon: WifiOff, color: 'text-red-500', text: 'Déconnecté' };
    return { icon: CheckCircle, color: 'text-green-500', text: 'Connecté' };
  };

  // Version minimisée
  if (isMinimized) {
    const status = getConnectionStatus();
    const StatusIcon = status.icon;
    
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Bot className="w-6 h-6" />
          <span className="hidden sm:inline">Assistant RH</span>
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
        </button>
      </div>
    );
  }

  // Non authentifié
  if (!auth.isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-96">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <h3 className="font-semibold">Assistant RH</h3>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:bg-blue-800 p-1 rounded transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  // Interface principale
  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header avec status de connexion */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Assistant RH</h3>
              <StatusIcon className={`w-3 h-3 ${status.color}`} />
            </div>
            <p className="text-xs opacity-90">
              {auth.user?.name} • {status.text}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-75">
            Backend {socket.isConnected ? 'OK' : 'KO'}
          </span>
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

      {/* Messages avec données réelles */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {/* Message de bienvenue avec données réelles */}
        {socket.messages.length === 0 && socket.isConnected && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="text-sm">
                  Bonjour {auth.user?.name} ! 👋<br />
                  Je suis connecté au backend et j'ai accès à vos vraies données RH.
                  
                  {leaves.balance && (
                    <div className="mt-2 text-xs text-gray-600">
                      🏖️ Vous avez {leaves.balance.paidLeave} jours de congés disponibles
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => handleQuickAction('view_leaves')}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
                  >
                    Voir mes congés
                  </button>
                  <button
                    onClick={() => handleQuickAction('view_payslip')}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs"
                  >
                    Ma paie
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages du chat */}
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
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}>
                  <div className="text-sm whitespace-pre-line">{message.content}</div>
                  <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              {/* Actions rapides */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.action, action.params)}
                      className="bg-white border border-blue-200 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Indicateur de typing */}
        {socket.isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Erreurs */}
        {socket.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {socket.error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Barre d'infos avec données réelles */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span>📅 Congés: {leaves.balance?.paidLeave || 0}j</span>
            <span>💼 Dept: {auth.user?.department}</span>
          </div>
          <div className="flex items-center gap-1">
            <StatusIcon className={`w-3 h-3 ${status.color}`} />
            <span>{status.text}</span>
          </div>
        </div>
      </div>

      {/* Zone de saisie */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tapez votre message..."
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
        
        <div className="mt-2 flex flex-wrap gap-1">
          {['Mes congés', 'Ma paie', 'Formations', 'Test connexion'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInputText(suggestion)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};