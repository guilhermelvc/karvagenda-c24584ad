import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Profissional, HorarioTrabalho } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Checkbox } from '@/components/ui/checkbox';

interface ProfissionalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profissional?: Profissional;
  onSuccess?: () => void;
}

const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function ProfissionalModal({ open, onOpenChange, profissional, onSuccess }: ProfissionalModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: profissional?.nome || '',
    email: profissional?.email || '',
    telefone: profissional?.telefone || '',
    especialidade: profissional?.especialidade || '',
  });

  const [horarios, setHorarios] = useState<HorarioTrabalho[]>(
    profissional?.horarios || diasSemana.map((_, index) => ({
      dia_semana: index,
      inicio: '09:00',
      fim: '18:00',
      intervalo_inicio: '12:00',
      intervalo_fim: '13:00',
    }))
  );

  const [diasFolga, setDiasFolga] = useState<number[]>(profissional?.dias_folga || [0]);

  const handleDiaFolgaChange = (dia: number, checked: boolean) => {
    if (checked) {
      setDiasFolga([...diasFolga, dia]);
    } else {
      setDiasFolga(diasFolga.filter(d => d !== dia));
    }
  };

  const handleHorarioChange = (index: number, field: keyof HorarioTrabalho, value: string) => {
    const newHorarios = [...horarios];
    newHorarios[index] = { ...newHorarios[index], [field]: value };
    setHorarios(newHorarios);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profissionalData = {
        ...formData,
        horarios,
        dias_folga: diasFolga,
        updated_at: new Date().toISOString(),
      };

      if (profissional?.id) {
        const { error } = await supabase
          .from('profissionais')
          .update(profissionalData)
          .eq('id', profissional.id);

        if (error) throw error;
        toast({ title: 'Profissional atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('profissionais')
          .insert([{ ...profissionalData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        toast({ title: 'Profissional cadastrado com sucesso!' });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar profissional',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{profissional ? 'Editar Profissional' : 'Novo Profissional'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do profissional e configure seus horários
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 98765-4321"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="especialidade">Especialidade</Label>
              <Input
                id="especialidade"
                value={formData.especialidade}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                placeholder="Ex: Cabeleireiro, Manicure, Esteticista"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Dias de Folga</Label>
            <div className="grid grid-cols-7 gap-2">
              {diasSemana.map((dia, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`folga-${index}`}
                    checked={diasFolga.includes(index)}
                    onCheckedChange={(checked) => handleDiaFolgaChange(index, checked as boolean)}
                  />
                  <Label htmlFor={`folga-${index}`} className="text-sm cursor-pointer">
                    {dia.slice(0, 3)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Horários de Trabalho</Label>
            <div className="space-y-3">
              {horarios.map((horario, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-center">
                  <Label className="text-sm">{diasSemana[index]}</Label>
                  
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">Início</Label>
                    <Input
                      type="time"
                      value={horario.inicio}
                      onChange={(e) => handleHorarioChange(index, 'inicio', e.target.value)}
                      disabled={diasFolga.includes(index)}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">Fim</Label>
                    <Input
                      type="time"
                      value={horario.fim}
                      onChange={(e) => handleHorarioChange(index, 'fim', e.target.value)}
                      disabled={diasFolga.includes(index)}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">Almoço</Label>
                    <Input
                      type="time"
                      value={horario.intervalo_inicio || ''}
                      onChange={(e) => handleHorarioChange(index, 'intervalo_inicio', e.target.value)}
                      disabled={diasFolga.includes(index)}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">Retorno</Label>
                    <Input
                      type="time"
                      value={horario.intervalo_fim || ''}
                      onChange={(e) => handleHorarioChange(index, 'intervalo_fim', e.target.value)}
                      disabled={diasFolga.includes(index)}
                    />
                  </div>

                  {diasFolga.includes(index) && (
                    <span className="text-xs text-muted-foreground">Folga</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : profissional ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
