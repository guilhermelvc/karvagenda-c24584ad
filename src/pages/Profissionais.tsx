import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Calendar, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function Profissionais() {
  // Mock data
  const profissionais = [
    {
      id: 1,
      nome: 'João Silva',
      especialidade: 'Cabeleireiro',
      avatar: '',
      horarios: 'Seg-Sex: 9h-18h',
      avaliacao: 4.8,
      totalAtendimentos: 342,
      status: 'ativo'
    },
    {
      id: 2,
      nome: 'Maria Santos',
      especialidade: 'Manicure',
      avatar: '',
      horarios: 'Ter-Sáb: 10h-19h',
      avaliacao: 4.9,
      totalAtendimentos: 456,
      status: 'ativo'
    },
    {
      id: 3,
      nome: 'Carlos Oliveira',
      especialidade: 'Barbeiro',
      avatar: '',
      horarios: 'Seg-Sex: 10h-20h',
      avaliacao: 4.7,
      totalAtendimentos: 289,
      status: 'ausente'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe de profissionais
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Em Atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">67% da equipe</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              4.8
              <Star className="h-5 w-5 fill-warning text-warning" />
            </div>
            <p className="text-xs text-muted-foreground">Excelente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Atendimentos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">+12% vs ontem</p>
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
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profissional.avatar} />
                    <AvatarFallback className="bg-gradient-primary text-white text-xl">
                      {profissional.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{profissional.nome}</CardTitle>
                    <CardDescription>{profissional.especialidade}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant={profissional.status === 'ativo' ? 'default' : 'secondary'}
                  className={profissional.status === 'ativo' ? 'bg-success' : ''}
                >
                  {profissional.status === 'ativo' ? 'Ativo' : 'Ausente'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{profissional.horarios}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{profissional.totalAtendimentos} atendimentos realizados</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-medium">{profissional.avaliacao}</span>
                  <span className="text-muted-foreground">avaliação</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button variant="outline" className="flex-1">Ver Agenda</Button>
                <Button variant="outline" className="flex-1">Editar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Template */}
      <Card>
        <CardHeader>
          <CardTitle>Horários Disponíveis</CardTitle>
          <CardDescription>
            Configure os horários de trabalho dos profissionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
              <div key={dia} className="text-center">
                <div className="font-medium mb-2">{dia}</div>
                <div className="space-y-2">
                  <div className="text-xs bg-success/10 text-success p-2 rounded">
                    09:00 - 12:00
                  </div>
                  <div className="text-xs bg-muted p-2 rounded text-muted-foreground">
                    Almoço
                  </div>
                  <div className="text-xs bg-success/10 text-success p-2 rounded">
                    14:00 - 18:00
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
