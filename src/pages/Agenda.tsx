import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Agenda() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { locale: ptBR }));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const timeSlots = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);

  // Mock appointments
  const appointments = [
    { dia: 1, hora: 2, cliente: 'Maria Silva', servico: 'Corte' },
    { dia: 1, hora: 4, cliente: 'Pedro Santos', servico: 'Barba' },
    { dia: 2, hora: 3, cliente: 'Ana Costa', servico: 'Manicure' },
    { dia: 3, hora: 5, cliente: 'Lucas Oliveira', servico: 'Massagem' },
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentWeekStart, 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
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
          <div className="grid grid-cols-8 gap-2">
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
                        <div className="absolute inset-1 bg-gradient-primary rounded p-2 text-white text-xs">
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
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-primary" />
              <span className="text-sm">Agendado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-border" />
              <span className="text-sm">Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted" />
              <span className="text-sm">Indisponível</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
