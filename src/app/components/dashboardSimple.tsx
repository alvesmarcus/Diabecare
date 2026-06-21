import { useState } from 'react';
import { CalendarScreenSimple } from './CalendarScreenSimple';
import { NutritionalListSimple } from './nutritionalListSimple';
import { MedicationManager, type Medication } from './medicationManager';
import { CarbCalculator } from './carbCalculator';

interface CalendarEntry {
  id: string;
  date: string;
  type: 'glicemia' | 'consulta' | 'refeicao';
  time: string;
  value?: string;
  description: string;
  patientCpf: string;
}

interface DashboardProps {
  user: string;
  userCpf: string;
  onLogout: () => void;
  onMedicationRequest: (patientName: string, patientAddress: string) => void;
  calendarEntries: CalendarEntry[];
  onAddCalendarEntry: (entry: Omit<CalendarEntry, 'id' | 'patientCpf'>) => void;
  medications: Medication[];
  onUpdateMedicationSchedules: (medicationId: string, schedules: string[]) => void;
}

type ActiveScreen = 'home' | 'calendar' | 'nutrition' | 'medications' | 'calculator';

export function DashboardSimple({ 
  user, 
  userCpf,
  onLogout, 
  onMedicationRequest,
  calendarEntries,
  onAddCalendarEntry,
  medications,
  onUpdateMedicationSchedules
}: DashboardProps) {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);

  const handleMedicationRequest = () => {
    const patientAddress = 'Rua das Flores, 123, Centro, São Paulo - SP';
    onMedicationRequest(user, patientAddress);
    setShowMedicationDialog(true);
  };

  const getTodayGlicemia = () => {
  const today = new Date().toISOString().split('T')[0];

  const todayEntries = calendarEntries.filter(
    e =>
      e.date === today &&
      e.type === 'glicemia' &&
      e.patientCpf === userCpf
  );

  if (todayEntries.length === 0) return '-';

  const latest = todayEntries[todayEntries.length - 1];
  return latest.value || '-';
};

  const getTodayMeals = () => {
  const today = new Date().toISOString().split('T')[0];

  return calendarEntries.filter(
    e =>
      e.date === today &&
      e.type === 'refeicao' &&
      e.patientCpf === userCpf
  ).length;
};

  const getTodayAppointments = () => {
  const today = new Date().toISOString().split('T')[0];

  return calendarEntries.filter(
    e =>
      e.date === today &&
      e.type === 'consulta' &&
      e.patientCpf === userCpf
  ).length;
};

  const renderScreen = () => {
    switch (activeScreen) {
      case 'calendar':
  return (
    <CalendarScreenSimple
      entries={calendarEntries.filter(
        entry => entry.patientCpf === userCpf
      )}
      onAddEntry={onAddCalendarEntry}
    />
  );
      case 'nutrition':
        return <NutritionalListSimple />;
      case 'medications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Meus Medicamentos</h2>
              <p className="text-gray-500">Gerencie os horários dos seus medicamentos</p>
            </div>
            <MedicationManager 
              medications={medications}
              onUpdateSchedules={onUpdateMedicationSchedules}
            />
          </div>
        );
      case 'calculator':
        return <CarbCalculator />;
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                className="bg-white border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveScreen('calendar')}
              >
                <h3 className="font-semibold mb-2">📅 Calendário</h3>
                <p className="text-sm text-gray-500">Registre glicemia, consultas e refeições</p>
              </div>

              <div 
                className="bg-white border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveScreen('medications')}
              >
                <h3 className="font-semibold mb-2">💊 Meus Medicamentos</h3>
                <p className="text-sm text-gray-500">Gerencie horários dos remédios</p>
                {medications.length > 0 && (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {medications.length} prescrito(s)
                  </span>
                )}
              </div>

              <div 
                className="bg-white border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleMedicationRequest}
              >
                <h3 className="font-semibold mb-2">📦 Solicitar Entrega</h3>
                <p className="text-sm text-gray-500">Receba seus medicamentos em casa</p>
              </div>

              <div 
                className="bg-white border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveScreen('nutrition')}
              >
                <h3 className="font-semibold mb-2">🍎 Lista Nutricional</h3>
                <p className="text-sm text-gray-500">Consulte alimentos e índice glicêmico</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border rounded-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setActiveScreen('calculator')}
              >
                <h3 className="font-semibold mb-2">🧮 Calculadora de Carboidratos</h3>
                <p className="text-sm opacity-90">Calcule a dose de insulina necessária</p>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Resumo do Dia</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{getTodayGlicemia()}</div>
                    <div className="text-sm text-gray-500">mg/dL - Última Glicemia</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{getTodayMeals()}</div>
                    <div className="text-sm text-gray-500">Refeições Registradas</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{getTodayAppointments()}</div>
                    <div className="text-sm text-gray-500">Consultas/Exames Hoje</div>
                  </div>
                </div>
              </div>
            </div>

            {getTodayAppointments() > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🔬</span>
                  <div>
                    <h3 className="font-semibold text-lg">Exames e Consultas Agendados</h3>
                    <p className="text-sm text-gray-600">Solicitados pelo seu médico</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {calendarEntries
                    .filter(e => e.type === 'consulta' && e.date >= new Date().toISOString().split('T')[0])
                    .slice(0, 5)
                    .map(exam => {
                      const examDate = new Date(exam.date + 'T00:00:00');
                      const isToday = exam.date === new Date().toISOString().split('T')[0];
                      return (
                        <div key={exam.id} className={`flex items-center justify-between p-4 rounded-lg ${
                          isToday ? 'bg-orange-100 border-2 border-orange-400' : 'bg-white border border-gray-200'
                        }`}>
                          <div>
                            <div className="flex items-center gap-2">
                              {isToday && <span className="text-xs font-bold text-orange-600 bg-orange-200 px-2 py-1 rounded">HOJE</span>}
                              <p className="font-medium">{exam.description}</p>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {examDate.toLocaleDateString('pt-BR')} às {exam.time}
                            </p>
                          </div>
                          <span className="text-2xl">🏥</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {medications.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Próximos Medicamentos</h3>
                <div className="space-y-2">
                  {medications.slice(0, 3).map(med => (
                    <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-500">{med.dosage}</p>
                      </div>
                      <div className="text-sm text-blue-600">
                        {med.schedules.length > 0 ? `${med.schedules.length} horário(s)` : 'Sem horários'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showMedicationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">✅ Solicitação Enviada com Sucesso!</h2>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm">
                  Sua solicitação de medicamentos foi enviada ao seu médico.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">📦 Você receberá no endereço cadastrado:</p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4">
                  <li>• Todas as suas medicações prescritas</li>
                  <li>• Insumos para medição de glicemia</li>
                  <li>• Instruções de uso</li>
                </ul>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-900">⏱️ Prazo: até 5 dias úteis</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowMedicationDialog(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                DC
              </div>
              <div>
                <h1 className="text-lg font-semibold">DiabeCare</h1>
                <p className="text-sm text-gray-500">Olá, {user}!</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setActiveScreen('home')}
                className={`px-4 py-2 rounded-md ${activeScreen === 'home' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              >
                Início
              </button>
              <button
                onClick={() => setActiveScreen('calendar')}
                className={`px-4 py-2 rounded-md ${activeScreen === 'calendar' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              >
                Calendário
              </button>
              <button
                onClick={() => setActiveScreen('medications')}
                className={`px-4 py-2 rounded-md ${activeScreen === 'medications' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              >
                Medicamentos
              </button>
              <button
                onClick={() => setActiveScreen('calculator')}
                className={`px-4 py-2 rounded-md ${activeScreen === 'calculator' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              >
                Calculadora
              </button>
              <button
                onClick={() => setActiveScreen('nutrition')}
                className={`px-4 py-2 rounded-md ${activeScreen === 'nutrition' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              >
                Nutrição
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                🚪 Sair
              </button>
            </nav>
            <div className="md:hidden">
              <button
                onClick={onLogout}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderScreen()}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="grid grid-cols-6 py-2">
          <button
            onClick={() => setActiveScreen('home')}
            className={`flex flex-col items-center py-2 ${activeScreen === 'home' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs">Início</span>
          </button>
          <button
            onClick={() => setActiveScreen('calendar')}
            className={`flex flex-col items-center py-2 ${activeScreen === 'calendar' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-xl">📅</span>
            <span className="text-xs">Calendário</span>
          </button>
          <button
            onClick={() => setActiveScreen('medications')}
            className={`flex flex-col items-center py-2 ${activeScreen === 'medications' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-xl">💊</span>
            <span className="text-xs">Remédios</span>
          </button>
          <button
            onClick={() => setActiveScreen('calculator')}
            className={`flex flex-col items-center py-2 ${activeScreen === 'calculator' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-xl">🧮</span>
            <span className="text-xs">Calc</span>
          </button>
          <button
            onClick={() => setActiveScreen('nutrition')}
            className={`flex flex-col items-center py-2 ${activeScreen === 'nutrition' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <span className="text-xl">🍎</span>
            <span className="text-xs">Nutrição</span>
          </button>
          <button
            onClick={onLogout}
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <span className="text-xl">🚪</span>
            <span className="text-xs">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}