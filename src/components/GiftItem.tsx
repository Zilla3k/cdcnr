import type { GiftItem as GiftItemType } from '../App';
import { Button } from './ui/button';
import { X, ShoppingCart, Trash2, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface GiftItemProps {
  gift: GiftItemType;
  currentGuest: string;
  onTogglePending: () => void;
  onCancelConfirmed: () => void;
  onToggleAlreadyOwned?: (giftId: string) => void;
  isAdmin?: boolean;
}

export function GiftItem({ gift, currentGuest, onTogglePending, onCancelConfirmed, onToggleAlreadyOwned, isAdmin }: GiftItemProps) {
  const isConfirmed = !!gift.selectedBy;
  const isConfirmedByMe = gift.selectedBy === currentGuest;
  const isConfirmedByOther = isConfirmed && !isConfirmedByMe;
  const isPendingByMe = gift.pendingBy === currentGuest;
  const isAvailable = !isConfirmed && !gift.alreadyOwned;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border transition-all gap-3 ${
        isConfirmedByOther || gift.alreadyOwned
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : isPendingByMe
          ? 'bg-pink-50 border-pink-300 shadow-sm'
          : isConfirmedByMe
          ? 'bg-green-50 border-green-300'
          : 'bg-white border-gray-200 hover:border-pink-300 hover:shadow-sm'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p
            className={`flex-1 min-w-0 ${
              isConfirmedByOther || gift.alreadyOwned
                ? 'line-through text-gray-500'
                : isConfirmedByMe
                ? 'text-green-600'
                : isPendingByMe
                ? 'text-pink-600'
                : 'text-gray-800'
            }`}
          >
            {gift.name}
          </p>
          <div className="flex gap-1 flex-wrap">
            {isPendingByMe && (
              <Badge variant="outline" className="border-pink-500 text-pink-600">
                No carrinho
              </Badge>
            )}
            {isConfirmedByMe && (
              <Badge variant="outline" className="border-green-500 text-green-600">
                Confirmado
              </Badge>
            )}
          </div>
        </div>
        {isConfirmedByOther && (
          <p className="text-gray-500 mt-1">
            Escolhido por {gift.selectedBy}
          </p>
        )}
        {gift.alreadyOwned && !isConfirmedByOther && (
          <p className="text-gray-500 mt-1">
            Os anfitriões já possuem este item
          </p>
        )}
      </div>

      <div className="flex gap-2 sm:flex-shrink-0">
        {isAdmin && onToggleAlreadyOwned && (
          <Button
            onClick={() => onToggleAlreadyOwned?.(gift.id.toString())}
            variant="outline"
            size="sm"
            className={`${gift.alreadyOwned ? 'border-gray-500 text-gray-600' : 'border-purple-500 text-purple-600'}`}
          >
            <CheckCircle className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">{gift.alreadyOwned ? 'Possui' : 'Marcar'}</span>
          </Button>
        )}
        
        {!isAdmin && (
          <>
            {isConfirmedByMe ? (
              <Button
                onClick={onCancelConfirmed}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50 flex-1 sm:flex-initial"
              >
                <Trash2 className="w-4 h-4 sm:mr-1" />
                <span className="sm:inline">Desistir</span>
              </Button>
            ) : isAvailable ? (
              <Button
                onClick={onTogglePending}
                variant={isPendingByMe ? 'outline' : 'default'}
                size="sm"
                className={`flex-1 sm:flex-initial ${isPendingByMe ? 'border-pink-500 text-pink-600' : 'bg-pink-500 hover:bg-pink-600'}`}
              >
                {isPendingByMe ? (
                  <>
                    <X className="w-4 h-4 sm:mr-1" />
                    <span className="sm:inline">Remover</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 sm:mr-1" />
                    <span className="sm:inline">Adicionar</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="text-gray-400 flex-1 sm:flex-initial"
              >
                Indisponível
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
