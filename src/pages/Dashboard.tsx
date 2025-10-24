import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, TrendingUp, Clock, DollarSign, Star, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Dashboard() {
  const [periodo, setPeriodo] = useState('30dias');
  
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

  // Dados para gráficos
  const receitaMensal = [
    { mes: 'Jul', receita: 12500, agendamentos: 85 },
    { mes: 'Ago', receita: 13200, agendamentos: 92 },
    { mes: 'Set', receita: 14100, agendamentos: 98 },
    { mes: 'Out', receita: 13800, agendamentos: 95 },
    { mes: 'Nov', receita: 15000, agendamentos: 105 },
    { mes: 'Dez', receita: 15420, agendamentos: 112 },
  ];

  const servicosPorCategoria = [
    { nome: 'Cabelo', valor: 35, cor: '#3B82F6' },
    { nome: 'Estética', valor: 28, cor: '#10B981' },
    { nome: 'Barba', valor: 18, cor: '#F59E0B' },
    { nome: 'Manicure', valor: 12, cor: '#8B5CF6' },
    { nome: 'Outros', valor: 7, cor: '#EF4444' },
  ];

  const taxaCancelamento = [
    { mes: 'Jul', taxa: 5.2 },
    { mes: 'Ago', taxa: 4.8 },
    { mes: 'Set', taxa: 3.9 },
    { mes: 'Out', taxa: 4.2 },
    { mes: 'Nov', taxa: 3.5 },
    { mes: 'Dez', taxa: 3.1 },
  ];

  const recentAppointments = [
    { id: 1, cliente: 'Maria Silva', servico: 'Corte de Cabelo', horario: '09:00', profissional: 'João' },
    { id: 2, cliente: 'Pedro Santos', servico: 'Barba', horario: '10:30', profissional: 'Carlos' },
    { id: 3, cliente: 'Ana Costa', servico: 'Manicure', horario: '14:00', profissional: 'Juliana' },
    { id: 4, cliente: 'Lucas Oliveira', servico: 'Massagem', horario: '15:30', profissional: 'Fernanda' },
  ];

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Relatório de Dashboard', 14, 20);
    
    // Período
    doc.setFontSize(12);
    doc.text(`Período: ${periodo === '7dias' ? 'Últimos 7 dias' : periodo === '30dias' ? 'Últimos 30 dias' : periodo === '90dias' ? 'Últimos 90 dias' : 'Último ano'}`, 14, 30);
    
    // Stats
    doc.setFontSize(14);
    doc.text('Resumo', 14, 40);
    autoTable(doc, {
      startY: 45,
      head: [['Métrica', 'Valor', 'Variação']],
      body: stats.map(stat => [stat.title, stat.value, stat.description]),
    });

    // Receita Mensal
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Receita Mensal', 14, 20);
    autoTable(doc, {
      startY: 25,
      head: [['Mês', 'Receita', 'Agendamentos']],
      body: receitaMensal.map(item => [item.mes, `R$ ${item.receita}`, item.agendamentos]),
    });

    doc.save(`dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7dias">Últimos 7 dias</SelectItem>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
              <SelectItem value="90dias">Últimos 90 dias</SelectItem>
              <SelectItem value="1ano">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportarPDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
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

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita e Agendamentos</CardTitle>
            <CardDescription>
              Evolução mensal de receita e número de agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={receitaMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="receita" stroke="#3B82F6" strokeWidth={2} name="Receita (R$)" />
                <Line yAxisId="right" type="monotone" dataKey="agendamentos" stroke="#10B981" strokeWidth={2} name="Agendamentos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>
              Proporção de serviços por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={servicosPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, valor }) => `${nome}: ${valor}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {servicosPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Cancelamento</CardTitle>
            <CardDescription>
              Evolução da taxa de cancelamento mensal (%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taxaCancelamento}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="taxa" fill="#EF4444" name="Taxa (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
      </div>

      {/* Services Card */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Mais Solicitados</CardTitle>
          <CardDescription>
            Top 5 serviços do mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[
              { servico: 'Corte de Cabelo', count: 156, rating: 4.8 },
              { servico: 'Manicure', count: 142, rating: 4.9 },
              { servico: 'Massagem', count: 98, rating: 4.7 },
              { servico: 'Design Sobrancelha', count: 87, rating: 4.8 },
              { servico: 'Barba', count: 76, rating: 4.6 },
            ].map((item, index) => (
              <div key={item.servico} className="flex flex-col items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary text-white font-bold mb-2">
                  {index + 1}
                </div>
                <p className="font-medium text-center">{item.servico}</p>
                <p className="text-sm text-muted-foreground">{item.count} vezes</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-medium">{item.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
