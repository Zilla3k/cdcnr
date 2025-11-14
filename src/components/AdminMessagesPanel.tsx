import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MessageCircleHeart, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import * as db from '../lib/supabase';

export function AdminMessagesPanel() {
  const [messages, setMessages] = useState<db.MessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadMessages();
    }
  }, [isOpen]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await db.supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
            <div className="flex items-center gap-3">
              <MessageCircleHeart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              <div className="text-left">
                <h3 className="text-gray-800">Mensagens dos Convidados</h3>
                <p className="text-gray-600">
                  {messages.length > 0 ? `${messages.length} mensagens` : 'Clique para ver'}
                </p>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          {loading ? (
            <p className="text-gray-600 text-center py-4">Carregando...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Nenhuma mensagem ainda</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-purple-600">{msg.guest_name}</p>
                    <p className="text-gray-400 whitespace-nowrap">
                      {formatDate(msg.created_at)}
                    </p>
                  </div>
                  <p className="text-gray-700">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
          
          {messages.length > 0 && (
            <Button
              onClick={loadMessages}
              variant="outline"
              size="sm"
              className="w-full mt-3 border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              Atualizar
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
