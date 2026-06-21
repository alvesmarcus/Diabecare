import { useState } from 'react';

interface CalendarEntry {
  id: string;
  date: string;
  type: 'glicemia' | 'consulta' | 'refeicao';
  time: string;
  value?: string;
  description: string;
  patientCpf: string;
}

interface CalendarScreenSimpleProps {
  entries: CalendarEntry[];
  onAddEntry: (entry: Omit<CalendarEntry, 'id' | 'patientCpf'>) => void;
}

export function CalendarScreenSimple({ entries, onAddEntry }: CalendarScreenSimpleProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [newEntry, setNewEntry] = useState({
    type: 'glicemia' as CalendarEntry['type'],
    time: '',
    value: '',
    description: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getFilteredEntries = () => {
    return entries.filter(entry => entry.date === selectedDate);
  };

  const getGlycemiaAlert = (value: number) => {
    if (value > 300) return { message: 'Glicemia em estado crítico', color: 'bg-red-600 text-white' };
    if (value > 200) return { message: 'Glicemia alta', color: 'bg-orange-500 text-white' };
    if (value > 99) return { message: 'Glicemia alterada', color: 'bg-yellow-500 text-white' };
    return null;
  };

  const getTypeIcon = (type: CalendarEntry['type']) => {
    switch (type) {
      case 'glicemia':
        return '🩸';
      case 'consulta':
        return '🏥';
      case 'refeicao':
        return '🍽️';
    }
  };

  const getTypeLabel = (type: CalendarEntry['type']) => {
    switch (type) {
      case 'glicemia':
        return 'Glicemia';
      case 'consulta':
        return 'Consulta/Exame';
      case 'refeicao':
        return 'Refeição';
    }
  };

  const getTypeColor = (type: CalendarEntry['type']) => {
    switch (type) {
      case 'glicemia':
        return 'border-l-red-500 bg-red-50';
      case 'consulta':
        return 'border-l-blue-500 bg-blue-50';
      case 'refeicao':
        return 'border-l-green-500 bg-green-50';
    }
  };

  const handleAddEntry = () => {
    if (!newEntry.time || !newEntry.description) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (newEntry.type === 'glicemia' && newEntry.value) {
      const glicemiaValue = parseInt(newEntry.value);
      const alert = getGlycemiaAlert(glicemiaValue);
      if (alert) {
        window.alert(`⚠️ ATENÇÃO: ${alert.message}\n\nValor: ${glicemiaValue} mg/dL\n\nConsulte seu médico.`);
      }
    }

    const entry = {
      date: selectedDate,
      type: newEntry.type,
      time: newEntry.time,
      value: newEntry.value,
      description: newEntry.description
    };

    onAddEntry(entry);
    setNewEntry({
      type: 'glicemia',
      time: '',
      value: '',
      description: ''
    });
    setIsDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-2">Novo Registro</h3>
            <p className="text-sm text-gray-500 mb-4">
              Adicione um novo registro para {formatDate(selectedDate)}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Registro</label>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value as CalendarEntry['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="glicemia">Glicemia</option>
                  <option value="consulta">Consulta/Exame</option>
                  <option value="refeicao">Refeição</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Horário *</label>
                <input
                  type="time"
                  value={newEntry.time}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {newEntry.type === 'glicemia' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Valor da Glicemia (mg/dL)</label>
                  <input
                    type="number"
                    placeholder="Ex: 120"
                    value={newEntry.value}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Descrição *</label>
                <textarea
                  placeholder={
                    newEntry.type === 'glicemia'
                      ? 'Ex: Glicemia pós-prandial'
                      : newEntry.type === 'consulta'
                      ? 'Ex: Consulta com endocrinologista'
                      : 'Ex: Almoço com arroz integral e frango'
                  }
                  value={newEntry.description}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddEntry}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Calendário de Saúde</h2>
          <p className="text-gray-500">Registre sua glicemia, consultas e refeições</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <span>➕</span> Novo Registro
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg">
        <div className="p-6 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <span>📅</span>
            {formatDate(selectedDate)}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {getFilteredEntries().length} registro(s) encontrado(s)
          </p>
        </div>
        <div className="p-6">
          {getFilteredEntries().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-5xl mb-4">📅</div>
              <p>Nenhum registro encontrado para esta data</p>
              <p className="text-sm mt-2">Adicione um novo registro usando o botão acima</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredEntries().map((entry) => (
                <div
                  key={entry.id}
                  className={`border-l-4 p-4 rounded-r-lg ${getTypeColor(entry.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getTypeIcon(entry.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{getTypeLabel(entry.type)}</span>
                        <span className="text-sm text-gray-500">{entry.time}</span>
                        {entry.value && (
                          <>
                            <span className="text-sm font-medium text-blue-600">
                              {entry.value} mg/dL
                            </span>
                            {(() => {
                              const alert = getGlycemiaAlert(parseInt(entry.value));
                              return alert ? (
                                <span className={`text-xs px-2 py-1 rounded ${alert.color}`}>
                                  {alert.message}
                                </span>
                              ) : null;
                            })()}
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}