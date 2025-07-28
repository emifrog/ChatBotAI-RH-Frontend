'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Bot, ArrowLeft, Menu, MoreVertical, 
  Calendar, FileText, Users, Minimize2, X 
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useSocket } from '../../../hooks/useSocket';
import { useAntibia } from '../../../hooks/useAntibia';
import { QuickActionsPanel } from '../hr/QuickActionsPanel';

interface MobileChatBotProps {
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export const MobileChatBot: React.FC<MobileChatBotProps> = ({ 
  isFullScreen, 
  onToggleFullScreen 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const auth = useAuth();
  const socket = useSocket(auth.token, 'mobile-conversation');
  const antibia = useAntibia(auth.token);

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
    setShowMenu(false);
  };

  if (!isFullScreen) {
    return (
      <div className="fixed bottom-4 right-4 z-50 sm:hidden">
        <button
          onClick={onToggleFullScreen}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200"
        >
          <Bot className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col sm:hidden">
      {/* Header Mobile */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleFullScreen}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <div>
              <h1 className="font-semibold">Assistant RH</h1>
              <p className="text-xs opacity-90">{auth.user?.name}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Indicateur de connexion */}
          <div className={`w-2 h-2 rounded-full ${socket.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Menu coulissant */}
      {showMenu && (
        <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-xl z-10 transform transition-transform duration-300">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Menu</h2>
            <button
              onClick={() => setShowMenu(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            <QuickActionsPanel 
              onAction={handleQuickAction}
              userRole={auth.user?.role}
            />
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {socket.messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-600' : 'bg-white border-2 border-gray-200'
                }`}>
                  {message.type === 'user' ? 
                    <User className="w-5 h-5 text-white" /> : 
                    <Bot className="w-5 h-5 text-gray-600" />
                  }
                </div>
                
                <div className={`rounded-2xl px-4 py-3 max-w-full ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}>
                  <div className="text-sm whitespace-pre-line break-words">{message.content}</div>
                  <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              {/* Actions rapides pour mobile */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.action, action.params)}
                      className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-blue-50 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Indicateur de frappe */}
        {socket.isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Barre de saisie mobile */}
      <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
        {/* Suggestions rapides */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {['Mes congés', 'Ma paie', 'Formations', 'Aide'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInputText(suggestion)}
              className="whitespace-nowrap px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
        
        {/* Input principal */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tapez votre message..."
              className="w-full bg-gray-100 border-0 rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={socket.isLoading || !socket.isConnected}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || socket.isLoading || !socket.isConnected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-full transition-colors shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};