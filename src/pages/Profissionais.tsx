import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Calendar, Star, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ProfissionalModal from '@/components/modals/ProfissionalModal';
import DeleteModal from '@/components/modals/DeleteModal';
import { Profissional } from '@/types';
import { supabase } from '@/lib/supabase';

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | undefined>();
  const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null);
  const [stats, setStats] = useState({
    totalProfissionais: 0,
    atendimentosHoje: 0,
    novosEsteMes: 0,
  });

  useEffect(() => {
    carregarProfissionais();
    carregarEstatisticas();
  }, []);

  const carregarProfissionais = async () => {
    const { data } = await supabase
      .from('profissionais')
      .select('*')
      .order('nome');
    
    if (data) setProfissionais(data);
  };

  const carregarEstatisticas = async () => {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.setHours(0, 0, 0, 0));
    const fimHoje = new Date(hoje.setHours(23, 59, 59, 999));
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Total de profissionais
    const { count: totalProfissionais } = await supabase
      .from('profissionais')
      .select('*', { count: 'exact', head: true });

    // Atendimentos hoje
    const { count: atendimentosHoje } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .gte('data_hora', inicioHoje.toISOString())
      .lte('data_hora', fimHoje.toISOString())
      .in('status', ['confirmado', 'concluido']);

    // Novos profissionais este mês
    const { count: novosEsteMes } = await supabase
      .from('profissionais')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', inicioMes.toISOString());

    setStats({
      totalProfissionais: totalProfissionais || 0,
      atendimentosHoje: atendimentosHoje || 0,
      novosEsteMes: novosEsteMes || 0,
    });
  };

  const handleEdit = (profissional: Profissional) => {
    setSelectedProfissional(profissional);
    setModalOpen(true);
  };

  const handleDelete = (id: string, nome: string) => {
    setDeleteItem({ id, name: nome });
    setDeleteModalOpen(true);
  };

  const handleNewProfissional = () => {
    setSelectedProfissional(undefined);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe de profissionais
          </p>
        </div>
        <Button className="gap-2" onClick={handleNewProfissional}>
          <Plus className="h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfissionais}</div>
            <p className="text-xs text-muted-foreground">+{stats.novosEsteMes} este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Profissionais Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profissionais.length}</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Atendimentos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.atendimentosHoje}</div>
            <p className="text-xs text-muted-foreground">Agendamentos confirmados</p>
          </CardContent>
        </Card>
      </div>

      {/* Professionals Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profissionais.map((profissional) => (
          <Card key={profissional.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 cursor-pointer" onClick={() => handleEdit(profissional)}>
                    <AvatarImage src={profissional.avatar_url} />
                    <AvatarFallback className="bg-gradient-primary text-white text-xl">
                      {profissional.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle 
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleEdit(profissional)}
                    >
                      {profissional.nome}
                    </CardTitle>
                    <CardDescription>{profissional.especialidade}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Horários configurados</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{profissional.especialidade}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleEdit(profissional)}>
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(profissional.id, profissional.nome)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProfissionalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        profissional={selectedProfissional}
        onSuccess={carregarProfissionais}
      />

      {deleteItem && (
        <DeleteModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          itemId={deleteItem.id}
          itemName={deleteItem.name}
          tableName="profissionais"
          onSuccess={carregarProfissionais}
        />
      )}
    </div>
  );
}
