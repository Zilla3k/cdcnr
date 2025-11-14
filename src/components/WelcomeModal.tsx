import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Home, Lock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface WelcomeModalProps {
  open: boolean;
  onSubmit: (name: string, password?: string) => void;
}

export function WelcomeModal({ open, onSubmit }: WelcomeModalProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), password || undefined);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e: any) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
              <Home className="w-8 h-8 text-pink-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Bem-vindo ao nosso Chá de Casa Nova!</DialogTitle>
          <DialogDescription className="text-center">
            Por favor, informe seu nome para continuar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seu nome</Label>
            <Input
              id="name"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          
          <Collapsible open={showAdminLogin} onOpenChange={setShowAdminLogin}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="w-full">
                <Lock className="w-3 h-3 mr-2" />
                Sou anfitrião
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <Label htmlFor="password">Senha de administrador</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </CollapsibleContent>
          </Collapsible>

          <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600" disabled={!name.trim()}>
            Continuar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}