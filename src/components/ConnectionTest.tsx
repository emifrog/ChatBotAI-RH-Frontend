import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { useLeaves } from '../../hooks/useLeaves';

export const ConnectionTest: React.FC = () => {
  const auth = useAuth();
  const socket = useSocket(auth.token);
  const { health, isHealthy } = useHealthCheck();
  const leaves = useLeaves();
  
  const [testResults, setTestResults] = useState<{
    auth: boolean | null;
    socket: boolean | null;
    api: boolean | null;
    data: boolean | null;
  }>({
    auth: null,
    socket: null,
    api: null,
    data: null
  });

  const runTests = async () => {
    console.log('🧪 Démarrage des tests de connexion...');
    
    // Test 1: Authentification
    try {
      if (auth.isAuthenticated) {
        setTestResults(prev => ({ ...prev, auth: true }));
        console.log('✅ Test Auth: OK');
      } else {
        setTestResults(prev => ({ ...prev, auth: false }));
        console.log('❌ Test Auth: Échec');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, auth: false }));
      console.error('❌ Test Auth: Erreur', error);
    }

    // Test 2: Socket.IO
    setTimeout(() => {
      try {
        if (socket.isConnected) {
          setTestResults(prev => ({ ...prev, socket: true }));
          console.log('✅ Test Socket: OK');
        } else {
          setTestResults(prev => ({ ...prev, socket: false }));
          console.log('❌ Test Socket: Échec');
        }
      } catch (error) {
        setTestResults(prev => ({ ...prev, socket: false }));
        console.error('❌ Test Socket: Erreur', error);
      }
    }, 1000);

    // Test 3: API Health
    setTimeout(() => {
      try {
        if (isHealthy && health) {
          setTestResults(prev => ({ ...prev, api: true }));
          console.log('✅ Test API: OK');
        } else {
          setTestResults(prev => ({ ...prev, api: false }));
          console.log('❌ Test API: Échec');
        }
      } catch (error) {
        setTestResults(prev => ({ ...prev, api: false }));
        console.error('❌ Test API: Erreur', error);
      }
    }, 2000);

    // Test 4: Données RH
    setTimeout(() => {
      try {
        if (leaves.balance && !leaves.error) {
          setTestResults(prev => ({ ...prev, data: true }));
          console.log('✅ Test Données: OK');
        } else {
          setTestResults(prev => ({ ...prev, data: false }));
          console.log('❌ Test Données: Échec');
        }
      } catch (error) {
        setTestResults(prev => ({ ...prev, data: false }));
        console.error('❌ Test Données: Erreur', error);
      }
    }, 3000);
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <Loader2 className="w-5 h-5 animate-spin text-gray-400" />;
    if (status === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'En cours...';
    if (status === true) return 'OK';
    return 'Échec';
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return 'text-gray-600';
    if (status === true) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          {socket.isConnected ? (
            <Wifi className="w-6 h-6 text-blue-600" />
          ) : (
            <WifiOff className="w-6 h-6 text-red-600" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Test de Connexion Backend</h2>
          <p className="text-sm text-gray-600">Vérification de l'intégration frontend ↔ backend</p>
        </div>
      </div>

      {/* Status général */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Backend URL:</span>
            <span className="ml-2 font-mono text-blue-600">
              {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Utilisateur:</span>
            <span className="ml-2 font-medium">
              {auth.user?.name || 'Non connecté'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Socket ID:</span>
            <span className="ml-2 font-mono text-xs">
              {socket.socket?.id || 'Non connecté'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Backend Status:</span>
            <span className={`ml-2 font-medium ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
              {health?.status || 'Inconnu'}
            </span>
          </div>
        </div>
      </div>

      {/* Tests détaillés */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(testResults.auth)}
            <div>
              <h3 className="font-medium">Authentification</h3>
              <p className="text-sm text-gray-600">JWT Token et session utilisateur</p>
            </div>
          </div>
          <span className={`font-medium ${getStatusColor(testResults.auth)}`}>
            {getStatusText(testResults.auth)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(testResults.socket)}
            <div>
              <h3 className="font-medium">Socket.IO</h3>
              <p className="text-sm text-gray-600">Connexion temps réel pour le chat</p>
            </div>
          </div>
          <span className={`font-medium ${getStatusColor(testResults.socket)}`}>
            {getStatusText(testResults.socket)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(testResults.api)}
            <div>
              <h3 className="font-medium">API REST</h3>
              <p className="text-sm text-gray-600">Endpoints de l'API backend</p>
            </div>
          </div>
          <span className={`font-medium ${getStatusColor(testResults.api)}`}>
            {getStatusText(testResults.api)}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(testResults.data)}
            <div>
              <h3 className="font-medium">Données RH</h3>
              <p className="text-sm text-gray-600">Congés, paie et formations</p>
            </div>
          </div>
          <span className={`font-medium ${getStatusColor(testResults.data)}`}>
            {getStatusText(testResults.data)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={runTests}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Lancer les Tests
        </button>
        
        {socket.isConnected && (
          <button
            onClick={() => socket.sendMessage('Test de connexion depuis le frontend')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Test Chat
          </button>
        )}
      </div>

      {/* Erreurs */}
      {(auth.error || socket.error || leaves.error) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">Erreurs détectées :</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {auth.error && <li>• Auth: {auth.error}</li>}
            {socket.error && <li>• Socket: {socket.error}</li>}
            {leaves.error && <li>• Données: {leaves.error}</li>}
          </ul>
        </div>
      )}

      {/* Debug info */}
      {process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true' && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Informations de debug
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(
              {
                auth: {
                  isAuthenticated: auth.isAuthenticated,
                  user: auth.user,
                  loading: auth.loading
                },
                socket: {
                  isConnected: socket.isConnected,
                  messagesCount: socket.messages.length,
                  isLoading: socket.isLoading
                },
                health,
                leaves: {
                  balance: leaves.balance,
                  requestsCount: leaves.requests.length,
                  loading: leaves.loading
                }
              },
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  );
};