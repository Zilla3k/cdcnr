import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

export interface GiftRow {
  id: number;
  name: string;
  description: string | null;
  category: string;
  priority: string | null;
  image_url: string | null;
  store_link: string | null;
  estimated_price: number | null;
  is_reserved: boolean | null;
  reserved_by: string | null;
  reserved_at: string | null;
  is_confirmed: boolean | null;
  confirmed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  already_owned: boolean | null;
}

export interface MessageRow {
  id: string;
  guest_name: string;
  message: string;
  created_at: string;
}

// Carregar presentes do banco
export async function loadGifts(): Promise<GiftRow[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error loading gifts:', error);
    throw error;
  }
  return data || [];
}

// Adicionar novo presente
export async function addGift(name: string, category?: string): Promise<GiftRow> {
  const { data, error } = await supabase
    .from('gifts')
    .insert([
      { 
        name, 
        category: category || null,
        priority: 'desirable',
        is_reserved: false,
        is_confirmed: false
      }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding gift:', error);
    throw error;
  }
  return data;
}

// Atualizar presente
export async function updateGift(id: number, updates: Partial<GiftRow>): Promise<GiftRow> {
  const { data, error } = await supabase
    .from('gifts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating gift:', error);
    throw error;
  }
  return data;
}

// Confirmar múltiplos presentes (transação)
export async function confirmGifts(guestName: string, giftIds: number[]): Promise<{ success: boolean; conflicts: GiftRow[] }> {
  // Verificar se há conflitos (alguém já confirmou enquanto estava no carrinho)
  const { data: currentGifts, error: checkError } = await supabase
    .from('gifts')
    .select('*')
    .in('id', giftIds);
  
  if (checkError) {
    console.error('Error checking gifts:', checkError);
    throw checkError;
  }

  const conflicts = currentGifts?.filter(g => g.is_confirmed && g.reserved_by && g.reserved_by !== guestName) || [];
  
  if (conflicts.length > 0) {
    return { success: false, conflicts };
  }

  // Confirmar presentes (definir como reservado e confirmado)
  const { error: updateError } = await supabase
    .from('gifts')
    .update({ 
      is_reserved: true, 
      reserved_by: guestName, 
      reserved_at: new Date().toISOString(),
      is_confirmed: true,
      confirmed_at: new Date().toISOString()
    })
    .in('id', giftIds)
    .is('is_confirmed', false); // Só atualizar se ainda não foi confirmado
  
  if (updateError) {
    console.error('Error confirming gifts:', updateError);
    throw updateError;
  }

  return { success: true, conflicts: [] };
}

// Enviar mensagem
export async function sendMessage(guestName: string, message: string): Promise<MessageRow> {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ guest_name: guestName, message }])
    .select()
    .single();
  
  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }
  return data;
}

// Subscrever a mudanças em tempo real
export function subscribeToGifts(callback: (payload: any) => void) {
  return supabase
    .channel('gifts-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'gifts' },
      callback
    )
    .subscribe();
}

// Inicializar banco de dados com presentes padrão (executar apenas uma vez)
export async function initializeGifts() {
  const { count } = await supabase
    .from('gifts')
    .select('*', { count: 'exact', head: true });
  
  if (count === 0) {
    const initialGifts = [
      { name: 'Error Load DB', description: 'Jogo de panelas antiaderente', category: 'Cozinha', priority: 'essential', estimated_price: 350.00 }
    ];

    await supabase.from('gifts').insert(
      initialGifts.map(g => ({
        ...g,
        is_reserved: false,
        is_confirmed: false
      }))
    );
  }
}
