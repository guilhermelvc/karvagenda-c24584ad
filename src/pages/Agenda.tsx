import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import AgendamentoModal from '@/components/modals/AgendamentoModal';
import { Agendamento } from '@/types';
import { supabase } from '@/lib/supabase';

export default function Agenda() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { locale: ptBR }));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | undefined>();

  const coresServicos: { [key: string]: string } = {
    'Corte de Cabelo': '#3B82F6',
    'Barba': '#10B981',
    'Manicure': '#F59E0B',
    'Massagem': '#8B5CF6',
    'Design Sobrancelha': '#EF4444',
    default: '#6B7280'
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    const { data } = await supabase
      .from('agendamentos')
      .select(`
        *,
        cliente:clientes(*),
        profissional:profissionais(*),
        servico:servicos(*)
      `)
      .order('data_hora');
    
    if (data) setAgendamentos(data);
  };

  const handleNewAgendamento = () => {
    setSelectedAgendamento(undefined);
    setModalOpen(true);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const timeSlots = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);

  const handleMonthSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentWeekStart(startOfWeek(date, { locale: ptBR }));
    }
  };

  // Mock appointments
  const appointments = [
    { dia: 1, hora: 2, cliente: 'Maria Silva', servico: 'Corte de Cabelo' },
    { dia: 1, hora: 4, cliente: 'Pedro Santos', servico: 'Barba' },
    { dia: 2, hora: 3, cliente: 'Ana Costa', servico: 'Manicure' },
    { dia: 3, hora: 5, cliente: 'Lucas Oliveira', servico: 'Massagem' },
    { dia: 4, hora: 2, cliente: 'Carla Lima', servico: 'Design Sobrancelha' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie seus agendamentos
          </p>
        </div>
        <Button className="gap-2" onClick={handleNewAgendamento}>
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(currentWeekStart, 'MMMM yyyy', { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleMonthSelect}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { locale: ptBR }))}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden md:grid md:grid-cols-8 gap-2">
            {/* Header - Time Column */}
            <div className="font-medium text-sm text-muted-foreground">Horário</div>
            
            {/* Header - Day Columns */}
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="text-center"
              >
                <div className="font-medium text-sm">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className={`text-lg font-bold ${
                  format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                    ? 'text-primary'
                    : ''
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}

            {/* Time Slots */}
            {timeSlots.map((time, timeIndex) => (
              <>
                {/* Time Label */}
                <div
                  key={time}
                  className="text-sm text-muted-foreground py-2 pr-2 text-right border-r border-border"
                >
                  {time}
                </div>

                {/* Day Cells */}
                {weekDays.map((day, dayIndex) => {
                  const appointment = appointments.find(
                    apt => apt.dia === dayIndex && apt.hora === timeIndex
                  );

                  return (
                    <div
                      key={`${day.toISOString()}-${time}`}
                      className="min-h-[60px] border border-border rounded-lg p-1 hover:bg-muted transition-colors cursor-pointer relative"
                    >
                      {appointment && (
                        <div 
                          className="absolute inset-1 rounded p-2 text-white text-xs"
                          style={{ backgroundColor: coresServicos[appointment.servico] || coresServicos.default }}
                        >
                          <div className="font-semibold truncate">{appointment.cliente}</div>
                          <div className="opacity-90 truncate">{appointment.servico}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {weekDays.map((day, dayIndex) => (
              <Card key={day.toISOString()} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{format(day, 'EEEE', { locale: ptBR })}</span>
                    <span className={`text-lg ${
                      format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                        ? 'text-primary font-bold'
                        : ''
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {timeSlots.map((time, timeIndex) => {
                    const appointment = appointments.find(
                      apt => apt.dia === dayIndex && apt.hora === timeIndex
                    );
                    
                    return appointment ? (
                      <div 
                        key={time}
                        className="p-3 rounded-lg text-white"
                        style={{ backgroundColor: coresServicos[appointment.servico] || coresServicos.default }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{time}</span>
                        </div>
                        <div className="font-medium">{appointment.cliente}</div>
                        <div className="text-sm opacity-90">{appointment.servico}</div>
                      </div>
                    ) : null;
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {Object.entries(coresServicos).filter(([key]) => key !== 'default').map(([servico, cor]) => (
              <div key={servico} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: cor }} />
                <span className="text-sm">{servico}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-border" />
              <span className="text-sm">Disponível</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AgendamentoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        agendamento={selectedAgendamento}
        onSuccess={carregarAgendamentos}
      />
    </div>
  );
}
