import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, TrendingUp, Clock, DollarSign, Star, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';

export default function Dashboard() {
  const [periodo, setPeriodo] = useState('30dias');
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    clientesAtivos: 0,
    taxaOcupacao: 0,
    receitaMensal: 0,
  });
  const [agendamentosRecentes, setAgendamentosRecentes] = useState<any[]>([]);
  const [servicosMaisRequisitados, setServicosMaisRequisitados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [graficoReceita, setGraficoReceita] = useState<any[]>([]);
  const [graficoCategoria, setGraficoCategoria] = useState<any[]>([]);
  const [graficoCancelamento, setGraficoCancelamento] = useState<any[]>([]);
  const [horariosPico, setHorariosPico] = useState<{ horario: string; percentual: number }[]>([]);
  useEffect(() => {
    carregarDadosDashboard();
  }, [periodo]);

  const carregarDadosDashboard = async () => {
    try {
      setLoading(true);
      const hoje = new Date();
      const inicioHoje = startOfDay(hoje);
      const fimHoje = endOfDay(hoje);

      // Agendamentos de hoje
      const { data: agendamentosHoje } = await supabase
        .from('agendamentos')
        .select('*')
        .gte('data_hora', inicioHoje.toISOString())
        .lte('data_hora', fimHoje.toISOString());

      // Clientes ativos (total)
      const { count: totalClientes } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      // Agendamentos do mês para calcular receita
      const inicioMes = startOfMonth(hoje);
      const fimMes = endOfMonth(hoje);
      
      const { data: agendamentosMes } = await supabase
        .from('agendamentos')
        .select(`
          *,
          servico:servicos(valor)
        `)
        .gte('data_hora', inicioMes.toISOString())
        .lte('data_hora', fimMes.toISOString())
        .in('status', ['confirmado', 'concluido']);

      const receitaMensal = agendamentosMes?.reduce((acc, ag) => acc + Number(ag.servico?.valor ?? 0), 0) || 0;

      // Próximos agendamentos de hoje
      const { data: proximosAgendamentos } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(nome),
          servico:servicos(nome),
          profissional:profissionais(nome)
        `)
        .gte('data_hora', inicioHoje.toISOString())
        .lte('data_hora', fimHoje.toISOString())
        .order('data_hora')
        .limit(5);

      // Serviços mais requisitados
      const { data: servicosData } = await supabase
        .from('agendamentos')
        .select(`
          servico_id,
          servico:servicos(nome, categoria, valor),
          status,
          data_hora
        `)
        .gte('data_hora', inicioMes.toISOString());

      const servicosCount = servicosData?.reduce((acc: any, item) => {
        const servicoNome = item.servico?.nome || 'Desconhecido';
        acc[servicoNome] = (acc[servicoNome] || 0) + 1;
        return acc;
      }, {});

      const topServicos = Object.entries(servicosCount || {})
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
        .map(([nome, count]) => ({ servico: nome, count }));

      // Gráficos dinâmicos (últimos 6 meses)
      const inicioPeriodo = startOfMonth(subMonths(hoje, 5));
      const { data: agsPeriodo } = await supabase
        .from('agendamentos')
        .select(`
          *,
          servico:servicos(valor, categoria)
        `)
        .gte('data_hora', inicioPeriodo.toISOString())
        .lte('data_hora', fimMes.toISOString());

      const meses = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(hoje, 5 - i);
        return { ini: startOfMonth(d), fim: endOfMonth(d) };
      });

      const grafReceita = meses.map(({ ini, fim }) => {
        const chave = format(ini, 'LLL');
        const doMes = (agsPeriodo || []).filter(a => new Date(a.data_hora) >= ini && new Date(a.data_hora) <= fim);
        const concluidos = doMes.filter(a => ['confirmado', 'concluido'].includes(a.status || ''));
        const receita = concluidos.reduce((acc, a) => acc + Number(a.servico?.valor ?? 0), 0);
        return { mes: chave, receita, agendamentos: concluidos.length };
      });

      const grafCancel = meses.map(({ ini, fim }) => {
        const chave = format(ini, 'LLL');
        const doMes = (agsPeriodo || []).filter(a => new Date(a.data_hora) >= ini && new Date(a.data_hora) <= fim);
        const total = doMes.length || 1;
        const cancelados = doMes.filter(a => a.status === 'cancelado').length;
        const taxa = Number(((cancelados / total) * 100).toFixed(1));
        return { mes: chave, taxa };
      });

      const contPorCategoria = (agendamentosMes || []).reduce((acc: any, a: any) => {
        const cat = a.servico?.categoria || 'Outros';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      const totalCat = Object.values(contPorCategoria).reduce((acc: number, v: any) => acc + (v as number), 0) || 1;
      const paleta = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6366F1'];
      const grafCat = Object.entries(contPorCategoria).map(([nome, qtd], idx) => ({
        nome,
        valor: Math.round((Number(qtd) / Number(totalCat)) * 100),
        cor: paleta[idx % paleta.length],
      }));

      setGraficoReceita(grafReceita);
      setGraficoCancelamento(grafCancel);
      setGraficoCategoria(grafCat);

      // Horários de pico (top 3 horas do dia)
      const contHoras: Record<string, number> = {};
      (agendamentosHoje || []).forEach((a: any) => {
        const h = new Date(a.data_hora).getHours();
        const label = `${String(h).padStart(2, '0')}:00 - ${String(h + 1).padStart(2, '0')}:00`;
        contHoras[label] = (contHoras[label] || 0) + 1;
      });
      const maxHora = Math.max(1, ...Object.values(contHoras));
      const topHoras = Object.entries(contHoras)
        .sort(([, a], [, b]) => Number(b) - Number(a))
        .slice(0, 3)
        .map(([horario, count]) => ({ horario, percentual: Math.round((Number(count) / maxHora) * 100) }));
      setHorariosPico(topHoras);

      setStats({
        agendamentosHoje: agendamentosHoje?.length || 0,
        clientesAtivos: totalClientes || 0,
        taxaOcupacao: agendamentosHoje?.length ? Math.min(100, (agendamentosHoje.length / 20) * 100) : 0,
        receitaMensal,
      });

      setAgendamentosRecentes(proximosAgendamentos || []);
      setServicosMaisRequisitados(topServicos);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Agendamentos Hoje',
      value: stats.agendamentosHoje.toString(),
      icon: Calendar,
      description: 'Agendamentos confirmados',
      color: 'text-primary',
    },
    {
      title: 'Clientes Ativos',
      value: stats.clientesAtivos.toString(),
      icon: Users,
      description: 'Total de clientes',
      color: 'text-success',
    },
    {
      title: 'Taxa de Ocupação',
      value: `${Math.round(stats.taxaOcupacao)}%`,
      icon: TrendingUp,
      description: 'Ocupação de hoje',
      color: 'text-warning',
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${stats.receitaMensal.toFixed(2)}`,
      icon: DollarSign,
      description: 'Receita do mês',
      color: 'text-accent',
    },
  ];

  // Dados para gráficos
  // dados de gráficos dinâmicos vêm de estado: graficoReceita

  // distribuição por categoria: graficoCategoria


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
      head: [['Métrica', 'Valor', 'Descrição']],
      body: statsCards.map(stat => [stat.title, stat.value, stat.description]),
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
        {statsCards.map((stat) => {
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
              <LineChart data={graficoReceita}>
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
                  data={graficoCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, valor }) => `${nome}: ${valor}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {graficoCategoria.map((entry, index) => (
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
              <BarChart data={graficoCancelamento}>
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
              {(horariosPico.length ? horariosPico : []).map((item) => (
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
              {horariosPico.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem dados para hoje</p>
              )}
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
            {servicosMaisRequisitados.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">Sem dados no período</p>
            ) : (
              servicosMaisRequisitados.map((item, index) => (
                <div key={item.servico} className="flex flex-col items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary text-white font-bold mb-2">
                    {index + 1}
                  </div>
                  <p className="font-medium text-center">{item.servico}</p>
                  <p className="text-sm text-muted-foreground">{item.count} vezes</p>
                </div>
              ))
            )}
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
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : agendamentosRecentes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum agendamento para hoje</p>
          ) : (
            <div className="space-y-3">
              {agendamentosRecentes.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-gradient-primary text-white">
                      <span className="text-xs font-medium">Hoje</span>
                      <span className="text-sm font-bold">{format(new Date(appointment.data_hora), 'HH:mm')}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.cliente?.nome}</p>
                      <p className="text-sm text-muted-foreground">{appointment.servico?.nome}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.profissional?.nome}</p>
                    <p className="text-xs text-muted-foreground">Profissional</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
