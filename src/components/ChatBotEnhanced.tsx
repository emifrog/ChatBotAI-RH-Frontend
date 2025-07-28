'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Bot, Minimize2, Maximize2, Settings, 
  ThumbsUp, ThumbsDown, Copy, MoreHorizontal 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useAntibia } from '../../hooks/useAntibia';
import { useNotifications, NotificationSystem } from './ui/NotificationSystem';
import { MobileChatBot } from './mobile/MobileChatBot';
import { LeaveCard } from './hr/LeaveCard';
import { PayrollCard } from './hr/PayrollCard';
import { TrainingCard } from './hr/TrainingCard';
import { QuickActionsPanel } from './hr/QuickActionsPanel';

export const ChatBotEnhanced: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileFullScreen, setIsMobileFullScreen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: 'up' | 'down' }>({});
  const [activeView, setActiveView] = useState<'chat' | 'dashboard'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const auth = useAuth();
  const socket = useSocket(auth.token, 'enhanced-conversation');
  const antibia = useAntibia(auth.token);
  const notifications = useNotifications();

  // Détection mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto scroll et focus
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [socket.messages]);

  useEffect(() => {
    if (!isMinimized && !isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized, isMobile]);

  // Gestion des actions
  const handleSendMessage = () => {
    if (!inputText.trim() || socket.isLoading) return;
    socket.sendMessage(inputText);
    setInputText('');
  };

  const handleQuickAction = (action: string, params?: any) => {
    socket.executeAction(action, params);
    
    // Notifications contextuelles
    switch (action) {
      case 'request_leave':
        notifications.showInfo('Demande de congés', 'Préparation de votre demande...');
        break;
      case 'download_payslip':
        notifications.showSuccess('Téléchargement', 'Votre bulletin de paie est en cours de téléchargement');
        break;
      case 'enroll_training':
        notifications.showInfo('Formation', 'Inscription en cours...');
        break;
    }
  };

  const handleFeedback = (messageId: string, type: 'up' | 'down') => {
    setFeedbacks(prev => ({ ...prev, [messageId]: type }));
    
    // Envoyer feedback au backend
    if (socket.socket) {
      socket.socket.emit('message_feedback', { messageId, type });
    }
    
    notifications.showSuccess(
      'Merci !', 
      type === 'up' ? 'Votre feedback positif nous aide à améliorer le service' : 'Nous prenons note de votre retour'
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notifications.showSuccess('Copié !', 'Le texte a été copié dans le presse-papiers');
  };

  // Version mobile
  if (isMobile) {
    return (
      <>
        <MobileChatBot 
          isFullScreen={isMobileFullScreen}
          onToggleFullScreen={() => setIsMobileFullScreen(!isMobileFullScreen)}
        />
        <NotificationSystem 
          notifications={notifications.notifications}
          onRemove={notifications.removeNotification}
        />
      </>
    );
  }

  // Non authentifié
  if (!auth.isAuthenticated) {
    if (isMinimized) {
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsMinimized(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
          >
            <Bot className="w-6 h-6" />
          </button>
        </div>
      );
    }

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
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-4">Connectez-vous pour accéder à votre assistant RH personnalisé</p>
            <button
              onClick={() => auth.login({ email: 'demo@company.com', password: 'demo' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Connexion démo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Version minimisée
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Bot className="w-6 h-6" />
          <span className="hidden sm:inline">Assistant RH</span>
          {socket.messages.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {socket.messages.filter(m => m.type === 'bot').length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex gap-4">
        {/* Panel Dashboard RH */}
        {activeView === 'dashboard' && (
          <div className="w-80 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Dashboard RH</h2>
              <button
                onClick={() => setActiveView('chat')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <QuickActionsPanel onAction={handleQuickAction} userRole={auth.user?.role} />
            
            {antibia.leaveBalance && (
              <LeaveCard 
                balance={antibia.leaveBalance}
                recentRequests={[]}
                onAction={handleQuickAction}
              />
            )}
            
            {antibia.payslips && antibia.payslips.length > 0 && (
              <PayrollCard 
                currentPayslip={{
                  id: antibia.payslips[0]?.id || '1',
                  period: antibia.payslips[0]?.period || 'N/A',
                  netSalary: antibia.payslips[0]?.netSalary || 0,
                  grossSalary: antibia.payslips[0]?.grossSalary || 0,
                  downloadUrl: antibia.payslips[0]?.downloadUrl || '',
                  status: 'available' as const
                }}
                previousPayslips={antibia.payslips.slice(1).map(p => ({
                  id: p.id,
                  period: p.period,
                  netSalary: p.netSalary,
                  grossSalary: p.grossSalary,
                  downloadUrl: p.downloadUrl,
                  status: 'available' as const
                }))}
                onAction={handleQuickAction}
              />
            )}
            
            {antibia.trainings && antibia.trainings.length > 0 && (
              <TrainingCard 
                recommendedTrainings={antibia.trainings.map(t => ({
                  id: t.id,
                  title: t.title,
                  description: t.description,
                  duration: t.duration,
                  availableSpots: t.availableSpots,
                  totalSpots: t.availableSpots + 5, // Estimation
                  recommended: t.recommended || false,
                  category: 'RH',
                  difficulty: 'intermediate' as const
                })).filter(t => t.recommended)}
                userTrainings={[]}
                onAction={handleQuickAction}
              />
            )}
          </div>
        )}

        {/* Chatbot Principal */}
        <div className="w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header amélioré */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Assistant RH</h3>
                <p className="text-xs opacity-90 flex items-center gap-2">
                  {auth.user?.name} • {auth.user?.department}
                  <span className={`w-2 h-2 rounded-full ${socket.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveView(activeView === 'chat' ? 'dashboard' : 'chat')}
                className="hover:bg-blue-800 p-1 rounded transition-colors"
                title="Dashboard RH"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="hover:bg-blue-800 p-1 rounded transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages avec interactions améliorées */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {socket.messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start gap-2 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' ? 'bg-blue-600' : 'bg-white border-2 border-gray-200'
                    }`}>
                      {message.type === 'user' ? 
                        <User className="w-4 h-4 text-white" /> : 
                        <Bot className="w-4 h-4 text-gray-600" />
                      }
                    </div>
                    <div className={`rounded-lg p-3 group relative ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                    }`}>
                      <div className="text-sm whitespace-pre-line break-words">{message.content}</div>
                      
                      {/* Actions sur les messages */}
                      {message.type === 'bot' && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleFeedback(message.id, 'up')}
                              className={`p-1 hover:bg-gray-100 rounded transition-colors ${
                                feedbacks[message.id] === 'up' ? 'text-green-600' : 'text-gray-400'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, 'down')}
                              className={`p-1 hover:bg-gray-100 rounded transition-colors ${
                                feedbacks[message.id] === 'down' ? 'text-red-600' : 'text-gray-400'
                              }`}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => copyToClipboard(message.content)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions rapides améliorées */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.action, action.params)}
                          className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Indicateur de typing amélioré */}
            {socket.isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-xs text-gray-500">Assistant en cours de réflexion...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie améliorée */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex gap-2 mb-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Posez votre question RH..."
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
            
            {/* Suggestions intelligentes */}
            <div className="flex flex-wrap gap-1">
              {['Congés restants', 'Dernier bulletin', 'Formations dispo', 'Aide RH'].map((suggestion) => (
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
        </div>
      </div>

      {/* Système de notifications */}
      <NotificationSystem 
        notifications={notifications.notifications}
        onRemove={notifications.removeNotification}
      />
    </>
  );
};

export default ChatBotEnhanced;