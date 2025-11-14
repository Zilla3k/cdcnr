import { Button } from './ui/button';
import { Card } from './ui/card';
import { Package, CheckCircle2, User } from 'lucide-react';

interface GiftFiltersProps {
  currentFilter: 'all' | 'available' | 'mine';
  onFilterChange: (filter: 'all' | 'available' | 'mine') => void;
}

export function GiftFilters({ currentFilter, onFilterChange }: GiftFiltersProps) {
  return (
    <Card className="p-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('all')}
          className={`flex-1 min-w-[90px] ${currentFilter === 'all' ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
        >
          <Package className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Todos</span>
          <span className="sm:hidden">Todos</span>
        </Button>
        <Button
          variant={currentFilter === 'available' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('available')}
          className={`flex-1 min-w-[90px] ${currentFilter === 'available' ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Disponíveis</span>
          <span className="sm:hidden">Livres</span>
        </Button>
        <Button
          variant={currentFilter === 'mine' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('mine')}
          className={`flex-1 min-w-[90px] ${currentFilter === 'mine' ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
        >
          <User className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Meus Presentes</span>
          <span className="sm:hidden">Meus</span>
        </Button>
      </div>
    </Card>
  );
}