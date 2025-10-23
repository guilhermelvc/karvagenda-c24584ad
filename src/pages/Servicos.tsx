import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Servicos() {
  // Mock data
  const servicos = [
    {
      id: 1,
      nome: 'Corte de Cabelo Masculino',
      descricao: 'Corte moderno e personalizado',
      duracao: 45,
      valor: 45.00,
      categoria: 'Cabelo',
      popular: true,
      totalAgendamentos: 156
    },
    {
      id: 2,
      nome: 'Corte de Cabelo Feminino',
      descricao: 'Corte, lavagem e finalização',
      duracao: 60,
      valor: 80.00,
      categoria: 'Cabelo',
      popular: true,
      totalAgendamentos: 142
    },
    {
      id: 3,
      nome: 'Barba Completa',
      descricao: 'Barba, bigode e acabamento',
      duracao: 30,
      valor: 30.00,
      categoria: 'Barba',
      popular: false,
      totalAgendamentos: 98
    },
    {
      id: 4,
      nome: 'Manicure',
      descricao: 'Cuidados com as unhas das mãos',
      duracao: 45,
      valor: 35.00,
      categoria: 'Estética',
      popular: true,
      totalAgendamentos: 189
    },
    {
      id: 5,
      nome: 'Pedicure',
      descricao: 'Cuidados com as unhas dos pés',
      duracao: 60,
      valor: 40.00,
      categoria: 'Estética',
      popular: false,
      totalAgendamentos: 145
    },
    {
      id: 6,
      nome: 'Massagem Relaxante',
      descricao: 'Massagem terapêutica de 60 minutos',
      duracao: 60,
      valor: 120.00,
      categoria: 'Bem-estar',
      popular: true,
      totalAgendamentos: 87
    },
  ];

  const categorias = Array.from(new Set(servicos.map(s => s.categoria)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicos.length}</div>
            <p className="text-xs text-muted-foreground">Em {categorias.length} categorias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Serviços Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {servicos.filter(s => s.popular).length}
            </div>
            <p className="text-xs text-muted-foreground">Mais solicitados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(servicos.reduce((acc, s) => acc + s.duracao, 0) / servicos.length)} min
            </div>
            <p className="text-xs text-muted-foreground">Por atendimento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(servicos.reduce((acc, s) => acc + s.valor, 0) / servicos.length).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Por serviço</p>
          </CardContent>
        </Card>
      </div>

      {/* Services by Category */}
      {categorias.map((categoria) => (
        <div key={categoria} className="space-y-4">
          <h2 className="text-2xl font-bold">{categoria}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servicos
              .filter(s => s.categoria === categoria)
              .map((servico) => (
                <Card key={servico.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{servico.nome}</CardTitle>
                        <CardDescription>{servico.descricao}</CardDescription>
                      </div>
                      {servico.popular && (
                        <Badge className="bg-gradient-primary">Popular</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Duração
                        </span>
                        <span className="font-medium">{servico.duracao} minutos</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          Valor
                        </span>
                        <span className="font-medium text-lg">
                          R$ {servico.valor.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          Agendamentos
                        </span>
                        <span className="font-medium">{servico.totalAgendamentos}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button variant="outline" className="flex-1">Editar</Button>
                      <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
