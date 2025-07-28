import { FileText, Download, Eye, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface Payslip {
  id: string;
  period: string;
  netSalary: number;
  grossSalary: number;
  downloadUrl: string;
  status: 'available' | 'processing' | 'archived';
}

interface PayrollCardProps {
  currentPayslip: Payslip;
  previousPayslips: Payslip[];
  onAction: (action: string, params?: any) => void;
}

export const PayrollCard: React.FC<PayrollCardProps> = ({ currentPayslip, previousPayslips, onAction }) => {
  const calculateTrend = () => {
    if (previousPayslips.length === 0) return { trend: 0, isPositive: true };
    
    const lastMonth = previousPayslips[0]?.netSalary || 0;
    const current = currentPayslip.netSalary;
    const trend = ((current - lastMonth) / lastMonth) * 100;
    
    return { trend: Math.abs(trend), isPositive: trend >= 0 };
  };

  const { trend, isPositive } = calculateTrend();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="p-2 bg-green-100 rounded-lg">
          <FileText className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Ma Paie</h3>
          <p className="text-sm text-gray-500">Bulletin de {currentPayslip.period}</p>
        </div>
      </div>

      {/* Salaire actuel */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(currentPayslip.netSalary)}
            </div>
            <div className="text-sm text-green-600">Salaire net</div>
            <div className="text-xs text-gray-500 mt-1">
              Brut: {formatCurrency(currentPayslip.grossSalary)}
            </div>
          </div>
          {trend > 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <TrendingUp className="w-3 h-3" />
              {isPositive ? '+' : '-'}{trend.toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Bulletins récents */}
      {previousPayslips.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Bulletins récents</h4>
          {previousPayslips.slice(0, 3).map((payslip) => (
            <div key={payslip.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{payslip.period}</span>
                <span className="text-sm text-gray-600">{formatCurrency(payslip.netSalary)}</span>
              </div>
              <button
                onClick={() => onAction('download_payslip', { payslipId: payslip.id })}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Download className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onAction('download_current_payslip', { payslipId: currentPayslip.id })}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Télécharger
        </button>
        <button
          onClick={() => onAction('payslip_details', { payslipId: currentPayslip.id })}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Détails
        </button>
      </div>
    </div>
  );
};