import { useState, useEffect } from 'react';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedules: string[];
}

interface MedicationManagerProps {
  medications: Medication[];
  onUpdateSchedules: (medicationId: string, schedules: string[]) => void;
}

export function MedicationManager({ medications, onUpdateSchedules }: MedicationManagerProps) {
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState('');
  const [showReminder, setShowReminder] = useState(false);
  const [reminderMed, setReminderMed] = useState<{ name: string; time: string } | null>(null);

  useEffect(() => {
    // Verifica lembretes a cada minuto
    const interval = setInterval(() => {
      checkMedicationReminders();
    }, 60000); // 60 segundos

    // Verifica imediatamente ao montar
    checkMedicationReminders();

    return () => clearInterval(interval);
  }, [medications]);

  const checkMedicationReminders = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    medications.forEach(med => {
      med.schedules.forEach(schedule => {
        // Calcula 15 minutos antes
        const [hours, minutes] = schedule.split(':').map(Number);
        const scheduleDate = new Date();
        scheduleDate.setHours(hours, minutes - 15, 0, 0);
        
        const reminderTime = `${String(scheduleDate.getHours()).padStart(2, '0')}:${String(scheduleDate.getMinutes()).padStart(2, '0')}`;
        
        if (currentTime === reminderTime) {
          setReminderMed({ name: med.name, time: schedule });
          setShowReminder(true);
        }
      });
    });
  };

  const handleAddSchedule = (medId: string) => {
    if (!newSchedule) return;
    
    const med = medications.find(m => m.id === medId);
    if (!med) return;

    const updatedSchedules = [...med.schedules, newSchedule].sort();
    onUpdateSchedules(medId, updatedSchedules);
    setNewSchedule('');
    setEditingMedId(null);
  };

  const handleRemoveSchedule = (medId: string, scheduleToRemove: string) => {
    const med = medications.find(m => m.id === medId);
    if (!med) return;

    const updatedSchedules = med.schedules.filter(s => s !== scheduleToRemove);
    onUpdateSchedules(medId, updatedSchedules);
  };

  if (medications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-5xl mb-4">💊</div>
        <p>Nenhum medicamento prescrito</p>
        <p className="text-sm mt-2">Aguarde a prescrição do seu médico</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showReminder && reminderMed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-pulse">
            <div className="text-center">
              <div className="text-6xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-2">Lembrete de Medicamento</h3>
              <p className="text-gray-600 mb-4">
                Está se aproximando o horário do seu medicamento:
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-lg">{reminderMed.name}</p>
                <p className="text-blue-600 font-medium">Horário: {reminderMed.time}</p>
              </div>
              <button
                onClick={() => {
                  setShowReminder(false);
                  setReminderMed(null);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                OK, Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {medications.map(med => (
        <div key={med.id} className="bg-white border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>💊</span> {med.name}
              </h3>
              <p className="text-sm text-gray-500">{med.dosage}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Horários:</h4>
            
            {med.schedules.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Nenhum horário definido. Clique em "Adicionar Horário" para definir.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {med.schedules.map((schedule, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md"
                  >
                    <span className="text-sm font-medium">{schedule}</span>
                    <button
                      onClick={() => handleRemoveSchedule(med.id, schedule)}
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {editingMedId === med.id ? (
              <div className="flex gap-2 mt-3">
                <input
                  type="time"
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleAddSchedule(med.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setEditingMedId(null);
                    setNewSchedule('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingMedId(med.id)}
                className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm"
              >
                ➕ Adicionar Horário
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>💡 Lembrete:</strong> Você receberá notificações 15 minutos antes de cada horário de medicamento.
        </p>
      </div>
    </div>
  );
}