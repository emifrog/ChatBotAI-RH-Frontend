import { Calendar, FileText, Users, HelpCircle, Settings, LogOut } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  color: string;
  description: string;
}

interface QuickActionsPanelProps {
  onAction: (action: string, params?: any) => void;
  userRole?: string;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ onAction, userRole }) => {
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<{ className?: string }> } = {
      calendar: Calendar,
      'file-text': FileText,
      users: Users,
      'help-circle': HelpCircle,
      settings: Settings,
      'log-out': LogOut,
    };
    return icons[iconName] || HelpCircle;
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Mes congés',
      icon: 'calendar',
      action: 'view_leaves',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Consulter soldes et faire une demande'
    },
    {
      id: '2',
      label: 'Ma paie',
      icon: 'file-text',
      action: 'view_payslip',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Bulletins et historique de paie'
    },
    {
      id: '3',
      label: 'Formations',
      icon: 'users',
      action: 'view_trainings',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Catalogue et inscriptions'
    },
    {
      id: '4',
      label: 'Aide RH',
      icon: 'help-circle',
      action: 'hr_help',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Questions et support'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-gray-600" />
        Actions Rapides
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const IconComponent = getIconComponent(action.icon);
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.action)}
              className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 hover:transform hover:scale-105 hover:shadow-lg group`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <IconComponent className="w-6 h-6" />
                <span className="font-medium text-sm">{action.label}</span>
                <span className="text-xs opacity-90 group-hover:opacity-100 transition-opacity">
                  {action.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Séparateur */}
      <div className="border-t border-gray-100 my-4"></div>
      
      {/* Actions secondaires */}
      <div className="space-y-2">
        <button
          onClick={() => onAction('user_profile')}
          className="w-full flex items-center gap-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-left"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Mon profil</span>
        </button>
        <button
          onClick={() => onAction('logout')}
          className="w-full flex items-center gap-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};