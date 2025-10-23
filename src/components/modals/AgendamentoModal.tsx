import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Agendamento, Cliente, Profissional, Servico } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento?: Agendamento;
  onSuccess?: () => void;
}

export default function AgendamentoModal({ open, onOpenChange, agendamento, onSuccess }: AgendamentoModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    cliente_id: agendamento?.cliente_id || '',
    profissional_id: agendamento?.profissional_id || '',
    servico_id: agendamento?.servico_id || '',
    data: agendamento ? new Date(agendamento.data_hora) : new Date(),
    horario: agendamento ? format(new Date(agendamento.data_hora), 'HH:mm') : '',
    status: agendamento?.status || 'agendado' as const,
    observacoes: agendamento?.observacoes || '',
  });

  useEffect(() => {
    if (open) {
      carregarDados();
    }
  }, [open]);

  useEffect(() => {
    if (formData.profissional_id && formData.data) {
      carregarHorariosDisponiveis();
    }
  }, [formData.profissional_id, formData.data]);

  const carregarDados = async () => {
    try {
      const [{ data: clientesData }, { data: profissionaisData }, { data: servicosData }] = await Promise.all([
        supabase.from('clientes').select('*').order('nome'),
        supabase.from('profissionais').select('*').order('nome'),
        supabase.from('servicos').select('*').eq('ativo', true).order('nome'),
      ]);

      if (clientesData) setClientes(clientesData);
      if (profissionaisData) setProfissionais(profissionaisData);
      if (servicosData) setServicos(servicosData);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const carregarHorariosDisponiveis = async () => {
    // Gera horários de 9h às 18h em intervalos de 30 minutos
    const horarios: string[] = [];
    for (let h = 9; h <= 18; h++) {
      horarios.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < 18) {
        horarios.push(`${h.toString().padStart(2, '0')}:30`);
      }
    }
    setHorariosDisponiveis(horarios);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataHora = new Date(formData.data);
      const [horas, minutos] = formData.horario.split(':');
      dataHora.setHours(parseInt(horas), parseInt(minutos));

      const agendamentoData = {
        cliente_id: formData.cliente_id,
        profissional_id: formData.profissional_id,
        servico_id: formData.servico_id,
        data_hora: dataHora.toISOString(),
        status: formData.status,
        observacoes: formData.observacoes,
        updated_at: new Date().toISOString(),
      };

      if (agendamento?.id) {
        const { error } = await supabase
          .from('agendamentos')
          .update(agendamentoData)
          .eq('id', agendamento.id);

        if (error) throw error;
        toast({ title: 'Agendamento atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('agendamentos')
          .insert([{ ...agendamentoData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        toast({ title: 'Agendamento criado com sucesso!' });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar agendamento',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do agendamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cliente_id">Cliente *</Label>
              <Select
                value={formData.cliente_id}
                onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="servico_id">Serviço *</Label>
              <Select
                value={formData.servico_id}
                onValueChange={(value) => setFormData({ ...formData, servico_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id}>
                      {servico.nome} - R$ {servico.valor.toFixed(2)} ({servico.duracao_minutos}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="profissional_id">Profissional *</Label>
              <Select
                value={formData.profissional_id}
                onValueChange={(value) => setFormData({ ...formData, profissional_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((profissional) => (
                    <SelectItem key={profissional.id} value={profissional.id}>
                      {profissional.nome} - {profissional.especialidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Data *</Label>
              <Calendar
                mode="single"
                selected={formData.data}
                onSelect={(date) => date && setFormData({ ...formData, data: date })}
                locale={ptBR}
                className="rounded-md border"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="horario">Horário *</Label>
              <Select
                value={formData.horario}
                onValueChange={(value) => setFormData({ ...formData, horario: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {horariosDisponiveis.map((horario) => (
                    <SelectItem key={horario} value={horario}>
                      {horario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : agendamento ? 'Atualizar' : 'Agendar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
