import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface AddGiftFormProps {
  onAdd: (giftName: string, category?: string) => void;
  error?: string;
  onInputChange?: () => void;
}

const categories = ['Cozinha', 'Banho', 'Quarto', 'Lavanderia', 'Limpeza', 'Decoração', 'Outro'];

export function AddGiftForm({ onAdd, error, onInputChange }: AddGiftFormProps) {
  const [newGiftName, setNewGiftName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGiftName.trim()) {
      onAdd(newGiftName.trim(), selectedCategory || undefined);
      // Não limpar os campos aqui, deixar para o componente pai decidir
    }
  };

  return (
    <Card className="p-4 sm:p-6 border-dashed border-2 border-pink-200 bg-pink-50/30">
      <h3 className="mb-4 text-gray-700">Adicionar Novo Presente</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Label htmlFor="new-gift" className="sr-only">
              Nome do presente
            </Label>
            <Input
              id="new-gift"
              placeholder="Ex: Cafeteira elétrica"
              value={newGiftName}
              onChange={(e) => {
                setNewGiftName(e.target.value);
                onInputChange?.();
              }}
              className={error ? 'border-red-500' : ''}
            />
          </div>
          <div className="w-full sm:w-40">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={!newGiftName.trim()} className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </form>
    </Card>
  );
}