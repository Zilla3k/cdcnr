import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { MessageCircleHeart, Send } from 'lucide-react';
import { toast } from 'sonner';
import * as db from '../lib/supabase';

interface MessageForHostsProps {
  guestName: string;
}

export function MessageForHosts({ guestName }: MessageForHostsProps) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await db.sendMessage(guestName, message.trim());
      toast.success('Mensagem enviada com sucesso!');
      setMessage('');
      setShowForm(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (!showForm) {
    return (
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MessageCircleHeart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 flex-shrink-0" />
            <div>
              <h3 className="text-gray-800">Deixe uma mensagem</h3>
              <p className="text-gray-600">Envie seus votos de felicidade</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            size="sm"
            className="border-pink-300 text-pink-600 hover:bg-pink-50 w-full sm:w-auto"
          >
            Escrever
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
      <div className="flex items-center gap-3 mb-4">
        <MessageCircleHeart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
        <h3 className="text-gray-800">Mensagem</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="message" className="text-gray-700">
            Sua mensagem
          </Label>
          <Textarea
            id="message"
            placeholder="Escreva uma mensagem especial..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-2"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!message.trim() || sending}
            className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar
          </Button>
        </div>
      </form>
    </Card>
  );
}