import { Card } from './ui/card';
import { Gift, CheckCircle2, ShoppingCart, Package } from 'lucide-react';

interface GiftStatsProps {
  stats: {
    total: number;
    selected: number;
    myConfirmed: number;
    myPending: number;
  };
}

export function GiftStats({ stats }: GiftStatsProps) {
  const available = stats.total - stats.selected;
  const progressPercentage = (stats.selected / stats.total) * 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 truncate">Total</p>
              <p className="text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 truncate">Escolhidos</p>
              <p className="text-gray-900">{stats.selected}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 truncate">Disponíveis</p>
              <p className="text-gray-900">{available}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-4 h-4 text-pink-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 truncate">Meus</p>
              <p className="text-gray-900">{stats.myConfirmed + stats.myPending}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Progresso</span>
          <span className="text-gray-900">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </Card>
    </div>
  );
}