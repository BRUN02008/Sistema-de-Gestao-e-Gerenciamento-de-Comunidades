import { useState } from 'react';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { mockEventos, type EventoAgenda } from '../data/mockData';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User, Filter } from 'lucide-react';
import { Select } from '../components/Select';

export function Agenda() {
  const [eventos] = useState<EventoAgenda[]>(mockEventos);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  const eventosFiltrados = filtroTipo === 'todos'
    ? eventos
    : eventos.filter(e => e.tipo === filtroTipo);

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      reuniao: 'bg-primary/20 text-primary',
      atividade: 'bg-secondary/20 text-secondary',
      evento: 'bg-accent/20 text-accent',
      outros: 'bg-muted text-muted-foreground'
    };
    return colors[tipo] || colors.outros;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      reuniao: 'Reunião',
      atividade: 'Atividade',
      evento: 'Evento',
      outros: 'Outros'
    };
    return labels[tipo] || tipo;
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const eventosOrdenados = [...eventosFiltrados].sort((a, b) =>
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  const eventosPorMes = eventosOrdenados.reduce((acc, evento) => {
    const mesAno = new Date(evento.data).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
    if (!acc[mesAno]) {
      acc[mesAno] = [];
    }
    acc[mesAno].push(evento);
    return acc;
  }, {} as Record<string, EventoAgenda[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Agenda Comunitária</h1>
          <p className="text-muted-foreground">Eventos e atividades programadas</p>
        </div>
        <Button>
          <Plus size={20} />
          Novo Evento
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground" size={20} />
            <Select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              options={[
                { value: 'todos', label: 'Todos os Tipos' },
                { value: 'reuniao', label: 'Reuniões' },
                { value: 'atividade', label: 'Atividades' },
                { value: 'evento', label: 'Eventos' },
                { value: 'outros', label: 'Outros' }
              ]}
              fullWidth
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {Object.entries(eventosPorMes).map(([mesAno, eventosDoMes]) => (
          <div key={mesAno}>
            <h2 className="text-foreground mb-4 capitalize">{mesAno}</h2>
            <div className="space-y-4">
              {eventosDoMes.map((evento) => (
                <Card key={evento.id} hover>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-4 rounded-lg text-center min-w-[80px]">
                        <div className="text-primary">
                          {new Date(evento.data).toLocaleDateString('pt-BR', { day: 'numeric' })}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {new Date(evento.data).toLocaleDateString('pt-BR', { month: 'short' })}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-foreground mb-1">{evento.titulo}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {formatarData(evento.data)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs ${getTipoColor(evento.tipo)}`}>
                            {getTipoLabel(evento.tipo)}
                          </span>
                        </div>

                        <p className="text-sm text-foreground mb-4">{evento.descricao}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={16} />
                            <span>{evento.horario}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin size={16} />
                            <span>{evento.local}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User size={16} />
                            <span>{evento.responsavel}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {eventosFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarIcon className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">Nenhum evento encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
