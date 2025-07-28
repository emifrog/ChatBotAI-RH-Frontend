import { Users, BookOpen, Star, Clock } from 'lucide-react';

interface Training {
  id: string;
  title: string;
  description: string;
  duration: string;
  availableSpots: number;
  totalSpots: number;
  recommended: boolean;
  category: string;
  startDate?: string;
  instructor?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface UserTraining {
  id: string;
  trainingId: string;
  title: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'cancelled';
  progress?: number;
  completionDate?: string;
}

interface TrainingCardProps {
  recommendedTrainings: Training[];
  userTrainings: UserTraining[];
  onAction: (action: string, params?: any) => void;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({ 
  recommendedTrainings, 
  userTrainings, 
  onAction 
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50';
      case 'in_progress':
        return 'text-blue-700 bg-blue-50';
      case 'enrolled':
        return 'text-yellow-700 bg-yellow-50';
      case 'cancelled':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BookOpen className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Mes Formations</h3>
          <p className="text-sm text-gray-500">{userTrainings.length} formations en cours</p>
        </div>
      </div>

      {/* Formations en cours */}
      {userTrainings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">En cours</h4>
          {userTrainings.slice(0, 2).map((training) => (
            <div key={training.id} className={`p-3 rounded-lg border ${getStatusColor(training.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{training.title}</div>
                  <div className="text-xs capitalize mt-1">{training.status.replace('_', ' ')}</div>
                </div>
                {training.progress !== undefined && (
                  <div className="text-right">
                    <div className="text-sm font-medium">{training.progress}%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all" 
                        style={{ width: `${training.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formations recommandées */}
      {recommendedTrainings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            Recommandées pour vous
          </h4>
          {recommendedTrainings.slice(0, 2).map((training) => (
            <div key={training.id} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-800">{training.title}</div>
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">{training.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(training.difficulty)}`}>
                      {training.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {training.duration}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {training.availableSpots}/{training.totalSpots}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onAction('enroll_training', { trainingId: training.id })}
                className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={training.availableSpots === 0}
              >
                {training.availableSpots === 0 ? 'Complet' : 'S\'inscrire'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onAction('browse_catalog')}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Catalogue complet
        </button>
        <button
          onClick={() => onAction('my_trainings')}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Mes formations
        </button>
      </div>
    </div>
  );
};