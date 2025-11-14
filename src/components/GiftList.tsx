import type { GiftItem as GiftItemType } from '../App';
import { GiftItem } from './GiftItem';
import { AddGiftForm } from './AddGiftForm';
import { GiftStats } from './GiftStats';
import { GiftFilters } from './GiftFilters';
import { ConfirmGiftsButton } from './ConfirmGiftsButton';
import { Card } from './ui/card';

interface GiftListProps {
  gifts: GiftItemType[];
  currentGuest: string;
  filter: 'all' | 'available' | 'mine';
  stats: {
    total: number;
    selected: number;
    myConfirmed: number;
    myPending: number;
  };
  onTogglePending: (giftId: string) => void;
  onConfirmGifts: () => { pendingGifts: GiftItemType[]; conflicts: GiftItemType[] };
  onFinalizeConfirmation: () => void;
  onCancelConfirmed: (giftId: string) => void;
  onAddGift: (giftName: string, category?: string) => void;
  onFilterChange: (filter: 'all' | 'available' | 'mine') => void;
  onToggleAlreadyOwned: (giftId: string) => void;
  isAdmin: boolean;
}

export function GiftList({ 
  gifts, 
  currentGuest, 
  filter,
  stats,
  onTogglePending,
  onConfirmGifts,
  onFinalizeConfirmation,
  onCancelConfirmed,
  onAddGift, 
  onFilterChange,
  onToggleAlreadyOwned,
  isAdmin
}: GiftListProps) {
  // Group by category
  const categories = Array.from(new Set(gifts.map(g => g.category).filter(Boolean))) as string[];
  const uncategorized = gifts.filter(g => !g.category);

  return (
    <div className="space-y-6">
      <GiftStats stats={stats} />
      
      <GiftFilters currentFilter={filter} onFilterChange={onFilterChange} />

      {stats.myPending > 0 && (
        <ConfirmGiftsButton
          pendingCount={stats.myPending}
          onConfirm={onConfirmGifts}
          onFinalize={onFinalizeConfirmation}
        />
      )}

      <div className="space-y-6">
        {categories.map(category => {
          const categoryGifts = gifts.filter(g => g.category === category);
          if (categoryGifts.length === 0) return null;
          
          return (
            <Card key={category} className="p-6">
              <h2 className="mb-4 text-gray-700">{category}</h2>
              <div className="space-y-2">
                {categoryGifts.map((gift) => (
                  <GiftItem
                    key={gift.id}
                    gift={gift}
                    currentGuest={currentGuest}
                    onTogglePending={() => onTogglePending(gift.id.toString())}
                    onCancelConfirmed={() => onCancelConfirmed(gift.id.toString())}
                    onToggleAlreadyOwned={() => onToggleAlreadyOwned(gift.id.toString())}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </Card>
          );
        })}

        {uncategorized.length > 0 && (
          <Card className="p-6">
            <h2 className="mb-4 text-gray-700">Outros</h2>
            <div className="space-y-2">
              {uncategorized.map((gift) => (
                <GiftItem
                  key={gift.id}
                  gift={gift}
                  currentGuest={currentGuest}
                  onTogglePending={() => onTogglePending(gift.id.toString())}
                  onCancelConfirmed={() => onCancelConfirmed(gift.id.toString())}
                  onToggleAlreadyOwned={() => onToggleAlreadyOwned(gift.id.toString())}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </Card>
        )}
      </div>

      <AddGiftForm onAdd={onAddGift} />
    </div>
  );
}