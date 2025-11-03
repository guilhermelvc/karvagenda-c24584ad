import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Servico } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ServicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servico?: Servico;
  onSuccess?: () => void;
}

export default function ServicoModal({ open, onOpenChange, servico, onSuccess }: ServicoModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: servico?.nome || '',
    descricao: servico?.descricao || '',
    duracao_minutos: servico?.duracao_minutos || 60,
    valor: servico?.valor || 0,
    categoria: servico?.categoria || '',
    ativo: servico?.ativo ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const servicoData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      if (servico?.id) {
        const { error } = await supabase
          .from('servicos')
          .update(servicoData)
          .eq('id', servico.id);

        if (error) throw error;
        toast({ title: 'Serviço atualizado com sucesso!' });
      } else {
        // Garantir user_id para RLS
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { error } = await supabase
          .from('servicos')
          .insert([{ ...servicoData, created_at: new Date().toISOString(), user_id: user.id }]);

        if (error) throw error;
        toast({ title: 'Serviço cadastrado com sucesso!' });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar serviço',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{servico ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do serviço oferecido
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Serviço *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                placeholder="Descreva o serviço..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ex: Cabelo, Estética, Barba"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duracao_minutos">Duração (minutos) *</Label>
                <Input
                  id="duracao_minutos"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.duracao_minutos}
                  onChange={(e) => setFormData({ ...formData, duracao_minutos: parseInt(e.target.value) })}
                  placeholder="Ex: 30, 45, 60, 90..."
                  required
                />
                <p className="text-xs text-muted-foreground">Digite qualquer valor em minutos</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ativo">Serviço Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  O serviço estará disponível para agendamento
                </p>
              </div>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : servico ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
