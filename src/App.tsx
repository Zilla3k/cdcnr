import { useState, useEffect } from 'react';
import { WelcomeModal } from './components/WelcomeModal';
import { GiftList } from './components/GiftList';
import { MessageForHosts } from './components/MessageForHosts';
import { AdminMessagesPanel } from './components/AdminMessagesPanel';
import { Toaster } from './components/ui/sonner';
import { Gift, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as db from './lib/supabase';

export interface GiftItem {
  id: number;
  name: string;
  category?: string;
  selectedBy: string | null;
  pendingBy: string | null;
  alreadyOwned: boolean;
}

const ADMIN_PASSWORD = 'admin123'; // Altere isso para sua senha

export default function App() {
  const [guestName, setGuestName] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'available' | 'mine'>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Converter GiftRow do Supabase para GiftItem
  const convertGiftRow = (row: db.GiftRow): GiftItem => ({
    id: row.id,
    name: row.name,
    category: row.category || undefined,
    selectedBy: row.is_confirmed ? row.reserved_by : null,
    pendingBy: row.is_reserved && !row.is_confirmed ? row.reserved_by : null,
    alreadyOwned: row.already_owned || false,
  });

  // Carregar presentes iniciais e configurar realtime
  useEffect(() => {
    loadInitialGifts();
    
    // Subscrever a mudanças em tempo real
    const subscription = db.subscribeToGifts((payload) => {
      console.log('Realtime update:', payload);
      
      if (payload.eventType === 'INSERT') {
        setGifts(prev => [...prev, convertGiftRow(payload.new)]);
      } else if (payload.eventType === 'UPDATE') {
        setGifts(prev => prev.map(g => 
          g.id === payload.new.id ? convertGiftRow(payload.new) : g
        ));
      } else if (payload.eventType === 'DELETE') {
        setGifts(prev => prev.filter(g => g.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadInitialGifts = async () => {
    try {
      setLoading(true);
      const data = await db.loadGifts();
      setGifts(data.map(convertGiftRow));
    } catch (error) {
      console.error('Error loading gifts:', error);
      toast.error('Erro ao carregar presentes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeSubmit = (name: string, password?: string) => {
    setGuestName(name);
    setShowWelcome(false);
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      toast.success('Bem-vindo, Anfitrião!');
    }
  };

  const handleToggleAlreadyOwned = async (giftId: string) => {
    const gift = gifts.find(g => g.id === parseInt(giftId));
    if (!gift) return;

    const newAlreadyOwned = !gift.alreadyOwned;

    // Atualizar localmente primeiro (otimista)
    setGifts(gifts.map(g => 
      g.id === parseInt(giftId) ? { ...g, alreadyOwned: newAlreadyOwned } : g
    ));

    try {
      await db.updateGift(parseInt(giftId), { 
        already_owned: newAlreadyOwned 
      });
      toast.success(newAlreadyOwned ? 'Item marcado como já possuído' : 'Item disponível novamente');
    } catch (error) {
      console.error('Error toggling already owned:', error);
      toast.error('Erro ao atualizar status do item');
      // Reverter mudança local
      setGifts(gifts.map(g => 
        g.id === parseInt(giftId) ? { ...g, alreadyOwned: gift.alreadyOwned } : g
      ));
    }
  };

  const handleTogglePending = async (giftId: string) => {
    const gift = gifts.find(g => g.id === parseInt(giftId));
    if (!gift) return;

    // Se o item já foi confirmado por alguém, não permitir alteração
    if (gift.selectedBy) {
      if (gift.selectedBy === guestName) {
        // Já confirmado por mim, não fazer nada
        return;
      } else {
        // Confirmado por outra pessoa
        toast.error(`Este presente já foi escolhido por ${gift.selectedBy}`);
        return;
      }
    }

    // Se o item está reservado por outra pessoa, mostrar aviso
    if (gift.pendingBy && gift.pendingBy !== guestName) {
      toast.error(`Este presente já está no carrinho de ${gift.pendingBy}`);
      return;
    }

    // Se chegou aqui, posso alterar (remover minha própria reserva ou adicionar)
    const newPendingBy = gift.pendingBy === guestName ? null : guestName;

    // Atualizar localmente primeiro (otimista)
    setGifts(gifts.map(g =>
      g.id === parseInt(giftId) ? { ...g, pendingBy: newPendingBy } : g
    ));

    try {
      await db.updateGift(parseInt(giftId), {
        is_reserved: newPendingBy !== null,
        reserved_by: newPendingBy,
        reserved_at: newPendingBy ? new Date().toISOString() : null
      });
    } catch (error) {
      console.error('Error toggling pending:', error);
      toast.error('Erro ao atualizar carrinho');
      // Reverter mudança local
      setGifts(gifts.map(g =>
        g.id === parseInt(giftId) ? { ...g, pendingBy: gift.pendingBy } : g
      ));
    }
  };

  const handleConfirmGifts = () => {
    // Verificar conflitos localmente
    const pendingGifts = gifts.filter(g => g.pendingBy === guestName);
    const conflicts = pendingGifts.filter(g => g.selectedBy && g.selectedBy !== guestName);
    
    return { pendingGifts, conflicts };
  };

  const handleFinalizeConfirmation = async () => {
    const pendingGiftIds = gifts
      .filter(g => g.pendingBy === guestName)
      .map(g => g.id);

    if (pendingGiftIds.length === 0) return;

    try {
      const result = await db.confirmGifts(guestName, pendingGiftIds);
      
      if (!result.success && result.conflicts.length > 0) {
        toast.error('Alguns presentes já foram escolhidos por outros convidados');
        // A atualização em tempo real vai atualizar os dados
        return;
      }

      toast.success('Presentes confirmados com sucesso!');
      // A atualização em tempo real vai atualizar os dados
    } catch (error) {
      console.error('Error finalizing confirmation:', error);
      toast.error('Erro ao confirmar presentes');
    }
  };

  const handleCancelConfirmed = async (giftId: string) => {
    const gift = gifts.find(g => g.id === parseInt(giftId));
    if (!gift || gift.selectedBy !== guestName) return;

    // Atualizar localmente primeiro (otimista)
    setGifts(gifts.map(g => 
      g.id === parseInt(giftId) ? { ...g, selectedBy: null } : g
    ));

    try {
      await db.updateGift(parseInt(giftId), { 
        is_reserved: false,
        reserved_by: null,
        reserved_at: null,
        is_confirmed: false,
        confirmed_at: null
      });
      toast.success('Presente liberado');
    } catch (error) {
      console.error('Error canceling confirmed gift:', error);
      toast.error('Erro ao cancelar presente');
      // Reverter mudança local
      setGifts(gifts.map(g => 
        g.id === parseInt(giftId) ? { ...g, selectedBy: guestName } : g
      ));
    }
  };

  const handleAddGift = async (giftName: string, category?: string) => {
    // Verificar se já existe um presente com o mesmo nome
    const existingGift = gifts.find(gift =>
      gift.name.toLowerCase().trim() === giftName.toLowerCase().trim()
    );

    if (existingGift) {
      toast.error(`O presente "${giftName}" já existe na lista!`);
      return;
    }

    try {
      await db.addGift(giftName, category);
      toast.success('Presente adicionado!');
      // A atualização em tempo real vai adicionar o presente
    } catch (error) {
      console.error('Error adding gift:', error);
      toast.error('Erro ao adicionar presente');
    }
  };

  const filteredGifts = gifts.filter(gift => {
    if (filter === 'available') return !gift.selectedBy && !gift.pendingBy && !gift.alreadyOwned;
    if (filter === 'mine') return gift.selectedBy === guestName || gift.pendingBy === guestName;
    return true;
  });

  const stats = {
    total: gifts.length,
    selected: gifts.filter(g => g.selectedBy).length,
    myConfirmed: gifts.filter(g => g.selectedBy === guestName).length,
    myPending: gifts.filter(g => g.pendingBy === guestName).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Toaster position="top-center" richColors />
      <WelcomeModal 
        open={showWelcome} 
        onSubmit={handleWelcomeSubmit} 
      />
      
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando presentes...</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl pb-16">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" />
              <h1 className="text-pink-600">Chá de Casa Nova</h1>
            </div>
            <p className="text-gray-600 px-4">
              Olá, {guestName || 'Convidado'}!{isAdmin && ' (Admin)'} {!isAdmin && 'Escolha seus presentes.'}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {!isAdmin && <MessageForHosts guestName={guestName} />}
            {isAdmin && <AdminMessagesPanel />}

            <GiftList
              gifts={filteredGifts}
              currentGuest={guestName}
              filter={filter}
              stats={stats}
              onTogglePending={handleTogglePending}
              onConfirmGifts={handleConfirmGifts}
              onFinalizeConfirmation={handleFinalizeConfirmation}
              onCancelConfirmed={handleCancelConfirmed}
              onAddGift={handleAddGift}
              onFilterChange={setFilter}
              onToggleAlreadyOwned={handleToggleAlreadyOwned}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}
    </div>
  );
}