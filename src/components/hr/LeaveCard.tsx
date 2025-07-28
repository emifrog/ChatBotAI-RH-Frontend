import React from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { formatDate, formatDuration } from '../../../utils/formatters';

interface LeaveBalance {
  paidLeave: number;
  rtt: number;
  sickLeave: number;
  lastUpdate: string;
}

interface LeaveRequest {
  id: string;
  type: 'paid' | 'rtt' | 'sick';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

interface LeaveCardProps {
  balance: LeaveBalance;
  recentRequests: LeaveRequest[];
  onAction: (action: string, params?: any) => void;
}

export const LeaveCard: React.FC<LeaveCardProps> = ({ balance, recentRequests, onAction }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Mes Congés</h3>
          <p className="text-sm text-gray-500">Mis à jour le {formatDate(balance.lastUpdate)}</p>
        </div>
      </div>

      {/* Soldes */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{balance.paidLeave}</div>
          <div className="text-xs text-blue-700">Congés payés</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{balance.rtt}</div>
          <div className="text-xs text-green-700">RTT</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{balance.sickLeave}</div>
          <div className="text-xs text-purple-700">Maladie</div>
        </div>
      </div>

      {/* Demandes récentes */}
      {recentRequests.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Demandes récentes</h4>
          {recentRequests.slice(0, 2).map((request) => (
            <div key={request.id} className={`p-3 rounded-lg border ${getStatusColor(request.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <span className="text-sm font-medium">
                    {formatDuration(request.days)} - {formatDate(request.startDate)}
                  </span>
                </div>
                <span className="text-xs capitalize">{request.status}</span>
              </div>
              {request.reason && (
                <p className="text-xs mt-1 opacity-75">{request.reason}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onAction('request_leave')}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Nouvelle demande
        </button>
        <button
          onClick={() => onAction('leave_history')}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Historique
        </button>
      </div>
    </div>
  );
};