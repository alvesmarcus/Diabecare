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

interface User {
  nome: string;
  cpf: string;
}

interface PatientCalendarViewProps {
  patients: User[];
  calendarEntries: CalendarEntry[];
  onClose: () => void;
}

export function PatientCalendarView({ patients, calendarEntries, onClose }: PatientCalendarViewProps) {
  const [selectedPatientCpf, setSelectedPatientCpf] = useState<string>(patients[0]?.cpf || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedPatient = patients.find(p => p.cpf === selectedPatientCpf);
  const patientEntries = calendarEntries.filter(e => e.patientCpf === selectedPatientCpf);

  // Todas as datas únicas com registros
  const uniqueDates = Array.from(new Set(patientEntries.map(e => e.date))).sort((a, b) => b.localeCompare(a));

  // Entradas do dia selecionado
  const todayEntries = patientEntries.filter(e => e.date === selectedDate);

  // Obter glicemias do dia
  const todayGlicemias = todayEntries
    .filter(e => e.type === 'glicemia' && e.value)
    .map(e => ({ ...e, numValue: parseInt(e.value!) }))
    .sort((a, b) => b.numValue - a.numValue);

  const getGlycemiaAlert = (value: number) => {
    if (value > 300) return { message: 'Estado crítico', color: 'bg-red-600 text-white' };
    if (value > 200) return { message: 'Alta', color: 'bg-orange-500 text-white' };
    if (value > 99) return { message: 'Alterada', color: 'bg-yellow-500 text-white' };
    return { message: 'Normal', color: 'bg-green-500 text-white' };
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (patients.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum paciente cadastrado ainda</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Calendário dos Pacientes</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ✕ Fechar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Selecionar Paciente</label>
            <select
              value={selectedPatientCpf}
              onChange={(e) => {
                setSelectedPatientCpf(e.target.value);
                // Reseta para hoje quando muda de paciente
                setSelectedDate(new Date().toISOString().split('T')[0]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {patients.map(patient => (
                <option key={patient.cpf} value={patient.cpf}>
                  {patient.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Selecionar Data</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Total de Registros</p>
            <p className="text-2xl font-bold text-blue-600">{patientEntries.length}</p>
            <p className="text-xs text-blue-700 mt-1">{uniqueDates.length} dias com dados</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">📊 Resumo Geral do Paciente</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {patientEntries.filter(e => e.type === 'glicemia').length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total de Glicemias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {patientEntries.filter(e => e.type === 'refeicao').length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total de Refeições</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {patientEntries.filter(e => e.type === 'consulta').length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Consultas/Exames</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {uniqueDates.length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Dias com Registros</div>
            </div>
          </div>
        </div>

        {uniqueDates.length > 0 && (
          <div className="bg-gray-50 border rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Datas com Registros:</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueDates.slice(0, 10).map(date => {
                const entriesCount = patientEntries.filter(e => e.date === date).length;
                const hasGlycemia = patientEntries.some(e => e.date === date && e.type === 'glicemia');
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-3 py-2 rounded-md text-sm transition-all ${
                      selectedDate === date
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-gray-300 hover:border-blue-400 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {hasGlycemia && <span>🩸</span>}
                      <span>{new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                      <span className="text-xs opacity-75">({entriesCount})</span>
                    </div>
                  </button>
                );
              })}
              {uniqueDates.length > 10 && (
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                  +{uniqueDates.length - 10} mais...
                </div>
              )}
            </div>
          </div>
        )}

        {todayGlicemias.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              🩸 Índices Glicêmicos do Dia - {formatDate(selectedDate)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayGlicemias.map((entry, idx) => {
                const alert = getGlycemiaAlert(entry.numValue);
                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg border-2 ${
                      idx === 0 ? 'border-red-500 shadow-lg' : 'border-gray-300'
                    } bg-white`}
                  >
                    {idx === 0 && (
                      <div className="text-xs font-bold text-red-600 mb-2">⚠️ MAIOR ÍNDICE</div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">{entry.time}</span>
                      <span className={`text-xs px-2 py-1 rounded ${alert.color}`}>
                        {alert.message}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-red-600">{entry.numValue}</div>
                    <div className="text-sm text-gray-500">mg/dL</div>
                    <p className="text-xs text-gray-600 mt-2">{entry.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🩸</span>
              <h4 className="font-semibold text-red-900">Glicemias</h4>
            </div>
            <div className="text-3xl font-bold text-red-600">
              {todayEntries.filter(e => e.type === 'glicemia').length}
            </div>
            <p className="text-xs text-red-700 mt-1">Medições no dia</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🍽️</span>
              <h4 className="font-semibold text-green-900">Refeições</h4>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {todayEntries.filter(e => e.type === 'refeicao').length}
            </div>
            <p className="text-xs text-green-700 mt-1">Registradas no dia</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏥</span>
              <h4 className="font-semibold text-blue-900">Consultas/Exames</h4>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {todayEntries.filter(e => e.type === 'consulta').length}
            </div>
            <p className="text-xs text-blue-700 mt-1">Agendamentos no dia</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Registros de {formatDate(selectedDate)}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {todayEntries.length} registro(s) encontrado(s)
            </p>
          </div>
          <div className="p-4">
            {todayEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-5xl mb-4">📅</div>
                <p>Nenhum registro encontrado para esta data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEntries
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((entry) => (
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
                                  return (
                                    <span className={`text-xs px-2 py-1 rounded ${alert.color}`}>
                                      {alert.message}
                                    </span>
                                  );
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
    </div>
  );
}
