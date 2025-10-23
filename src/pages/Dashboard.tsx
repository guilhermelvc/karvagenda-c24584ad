import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, TrendingUp, Clock, DollarSign, Star } from 'lucide-react';

export default function Dashboard() {
  // Dados mockados para demonstração
  const stats = [
    {
      title: 'Agendamentos Hoje',
      value: '12',
      icon: Calendar,
      description: '+3 desde ontem',
      color: 'text-primary',
    },
    {
      title: 'Clientes Ativos',
      value: '248',
      icon: Users,
      description: '+18 este mês',
      color: 'text-success',
    },
    {
      title: 'Taxa de Ocupação',
      value: '87%',
      icon: TrendingUp,
      description: '+5% vs semana passada',
      color: 'text-warning',
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 15.420',
      icon: DollarSign,
      description: '+12% vs mês anterior',
      color: 'text-accent',
    },
  ];

  const recentAppointments = [
    { id: 1, cliente: 'Maria Silva', servico: 'Corte de Cabelo', horario: '09:00', profissional: 'João' },
    { id: 2, cliente: 'Pedro Santos', servico: 'Barba', horario: '10:30', profissional: 'Carlos' },
    { id: 3, cliente: 'Ana Costa', servico: 'Manicure', horario: '14:00', profissional: 'Juliana' },
    { id: 4, cliente: 'Lucas Oliveira', servico: 'Massagem', horario: '15:30', profissional: 'Fernanda' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Horários de Pico</CardTitle>
            <CardDescription>
              Horários com mais agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { horario: '09:00 - 12:00', percentual: 85 },
                { horario: '14:00 - 17:00', percentual: 92 },
                { horario: '17:00 - 20:00', percentual: 78 },
              ].map((item) => (
                <div key={item.horario} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {item.horario}
                    </span>
                    <span className="font-medium">{item.percentual}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary transition-all"
                      style={{ width: `${item.percentual}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Solicitados</CardTitle>
            <CardDescription>
              Top 3 serviços do mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { servico: 'Corte de Cabelo', count: 156, rating: 4.8 },
                { servico: 'Manicure', count: 142, rating: 4.9 },
                { servico: 'Massagem', count: 98, rating: 4.7 },
              ].map((item, index) => (
                <div key={item.servico} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.servico}</p>
                      <p className="text-sm text-muted-foreground">{item.count} agendamentos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">{item.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
          <CardDescription>
            Agendamentos para hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-gradient-primary text-white">
                    <span className="text-xs font-medium">Hoje</span>
                    <span className="text-sm font-bold">{appointment.horario}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{appointment.cliente}</p>
                    <p className="text-sm text-muted-foreground">{appointment.servico}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{appointment.profissional}</p>
                  <p className="text-xs text-muted-foreground">Profissional</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
