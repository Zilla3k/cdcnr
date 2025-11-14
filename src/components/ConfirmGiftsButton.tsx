import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Check, AlertTriangle, ShoppingBag } from 'lucide-react';
import type { GiftItem } from '../App';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ConfirmGiftsButtonProps {
  pendingCount: number;
  onConfirm: () => { pendingGifts: GiftItem[]; conflicts: GiftItem[] };
  onFinalize: () => void;
}

export function ConfirmGiftsButton({ pendingCount, onConfirm, onFinalize }: ConfirmGiftsButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmResult, setConfirmResult] = useState<{ pendingGifts: GiftItem[]; conflicts: GiftItem[] } | null>(null);

  const handleConfirmClick = () => {
    const result = onConfirm();
    setConfirmResult(result);
    setShowConfirmDialog(true);
  };

  const handleFinalConfirm = () => {
    if (confirmResult && confirmResult.conflicts.length === 0) {
      onFinalize();
      setShowConfirmDialog(false);
      setConfirmResult(null);
    }
  };

  const hasConflicts = confirmResult && confirmResult.conflicts.length > 0;

  return (
    <>
      <Card className="p-4 sm:p-6 bg-pink-50 border-pink-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-gray-800">Carrinho</h3>
              <p className="text-gray-600">
                {pendingCount} {pendingCount === 1 ? 'item' : 'itens'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleConfirmClick}
            size="default"
            className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Confirmar
          </Button>
        </div>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            {hasConflicts ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <AlertDialogTitle className="text-center">
                  Alguns itens já foram escolhidos
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  Os seguintes presentes já foram confirmados:
                </AlertDialogDescription>
                <div className="my-4 space-y-2 max-h-[40vh] overflow-y-auto">
                  {confirmResult?.conflicts.map(gift => (
                    <div key={gift.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-gray-800">{gift.name}</p>
                      <p className="text-orange-600">Por {gift.selectedBy}</p>
                    </div>
                  ))}
                </div>
                <AlertDialogDescription className="text-center">
                  Remova estes itens e tente novamente.
                </AlertDialogDescription>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <AlertDialogTitle className="text-center">
                  Confirmar seus presentes?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  {confirmResult?.pendingGifts.length}{' '}
                  {confirmResult?.pendingGifts.length === 1 ? 'presente' : 'presentes'}:
                </AlertDialogDescription>
                <div className="my-4 space-y-2 max-h-[40vh] overflow-y-auto">
                  {confirmResult?.pendingGifts.map(gift => (
                    <div key={gift.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-gray-800">{gift.name}</p>
                      {gift.category && (
                        <p className="text-green-600">{gift.category}</p>
                      )}
                    </div>
                  ))}
                </div>
                <AlertDialogDescription className="text-center">
                  Outros convidados não poderão escolher estes presentes.
                </AlertDialogDescription>
              </>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto m-0">
              {hasConflicts ? 'Entendi' : 'Cancelar'}
            </AlertDialogCancel>
            {!hasConflicts && (
              <AlertDialogAction
                onClick={handleFinalConfirm}
                className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto m-0"
              >
                Confirmar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}