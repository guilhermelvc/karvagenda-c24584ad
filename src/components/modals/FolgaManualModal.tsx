import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DiaFolgaManual } from '@/types';

interface FolgaManualModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (folga: DiaFolgaManual) => void;
}

export default function FolgaManualModal({ open, onOpenChange, onAdd }: FolgaManualModalProps) {
  const [formData, setFormData] = useState<DiaFolgaManual>({
    data: '',
    descricao: '',
    dia_todo: true,
    horario_inicio: '09:00',
    horario_fim: '18:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      data: '',
      descricao: '',
      dia_todo: true,
      horario_inicio: '09:00',
      horario_fim: '18:00',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Folga/Feriado</DialogTitle>
          <DialogDescription>
            Configure uma folga ou feriado específico
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Natal, Férias, Compromisso pessoal"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dia_todo">Dia Todo</Label>
                <p className="text-sm text-muted-foreground">
                  Marcar o dia inteiro como folga
                </p>
              </div>
              <Switch
                id="dia_todo"
                checked={formData.dia_todo}
                onCheckedChange={(checked) => setFormData({ ...formData, dia_todo: checked })}
              />
            </div>

            {!formData.dia_todo && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="horario_inicio">Horário Início</Label>
                  <Input
                    id="horario_inicio"
                    type="time"
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="horario_fim">Horário Fim</Label>
                  <Input
                    id="horario_fim"
                    type="time"
                    value={formData.horario_fim}
                    onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
