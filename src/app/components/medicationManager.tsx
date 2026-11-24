
import { useEffect, useState } from 'react';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedules: string[];
  vezesPorDia: number;
}

interface MedicationManagerProps {
  medications: Medication[];
  onUpdateSchedules: (
    medicationId: string,
    schedules: string[]
  ) => void | Promise<void>;
}

export function MedicationManager({
  medications,
  onUpdateSchedules,
}: MedicationManagerProps) {
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState('');
  const [showReminder, setShowReminder] = useState(false);
  const [reminderMed, setReminderMed] = useState<{
    name: string;
    time: string;
  } | null>(null);

  // Verifica os lembretes dos medicamentos
  useEffect(() => {
    const checkMedicationReminders = () => {
      const now = new Date();

      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      medications.forEach((med) => {
        med.schedules.forEach((schedule) => {
          const [hours, minutes] = schedule.split(':').map(Number);

          const scheduleDate = new Date();
          scheduleDate.setHours(hours, minutes - 15, 0, 0);

          const reminderTime = `${String(
            scheduleDate.getHours()
          ).padStart(2, '0')}:${String(
            scheduleDate.getMinutes()
          ).padStart(2, '0')}`;

          if (currentTime === reminderTime) {
            setReminderMed({ name: med.name, time: schedule });
            setShowReminder(true);
          }
        });
      });
    };

    const interval = window.setInterval(
      checkMedicationReminders,
      60000
    );

    checkMedicationReminders();

    return () => window.clearInterval(interval);
  }, [medications]);

  // Adiciona um horário
  const handleAddSchedule = async (medId: string) => {
    if (!newSchedule) return;

    const med = medications.find((item) => item.id === medId);
    if (!med) return;

    const limit = Math.max(
      1,
      Math.min(2, Number(med.vezesPorDia) || 1)
    );

    if (med.schedules.length >= limit) {
      alert(`Esta prescrição permite ${limit} horário(s) por dia.`);
      return;
    }

    if (med.schedules.includes(newSchedule)) {
      alert('Esse horário já foi cadastrado. Escolha outro horário.');
      return;
    }

    const updatedSchedules = [...med.schedules, newSchedule].sort();

    await onUpdateSchedules(medId, updatedSchedules);

    setNewSchedule('');
    setEditingMedId(null);
  };

  // Remove um horário
  const handleRemoveSchedule = async (
    medId: string,
    scheduleToRemove: string
  ) => {
    const med = medications.find((item) => item.id === medId);
    if (!med) return;

    const updatedSchedules = med.schedules.filter(
      (schedule) => schedule !== scheduleToRemove
    );

    await onUpdateSchedules(medId, updatedSchedules);
  };

  // Permite escolher qual horário será mantido
  const handleKeepSchedule = async (
    medId: string,
    scheduleToKeep: string
  ) => {
    const med = medications.find((item) => item.id === medId);
    if (!med) return;

    const limit = Math.max(
      1,
      Math.min(2, Number(med.vezesPorDia) || 1)
    );

    if (med.schedules.length <= limit) return;
    if (!med.schedules.includes(scheduleToKeep)) return;

    const confirmed = window.confirm(
      `Deseja manter o horário ${scheduleToKeep}? Os demais horários serão removidos.`
    );

    if (!confirmed) return;

    await onUpdateSchedules(medId, [scheduleToKeep]);
  };

  // Estado vazio
  if (medications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-5xl mb-4">💊</div>
        <p>Nenhum medicamento prescrito</p>
        <p className="text-sm mt-2">
          Aguarde a prescrição do seu médico
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Lembrete de medicamento */}
      {showReminder && reminderMed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-pulse">
            <div className="text-center">
              <div className="text-6xl mb-4">⏰</div>

              <h3 className="text-xl font-bold mb-2">
                Lembrete de Medicamento
              </h3>

              <p className="text-gray-600 mb-4">
                Está se aproximando o horário do seu medicamento:
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-lg">
                  {reminderMed.name}
                </p>

                <p className="text-blue-600 font-medium">
                  Horário: {reminderMed.time}
                </p>
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

      {/* Lista de medicamentos */}
      {medications.map((med) => {
        const limit = Math.max(
          1,
          Math.min(2, Number(med.vezesPorDia) || 1)
        );

        const canAdd = med.schedules.length < limit;
        const hasExcessSchedules = med.schedules.length > limit;

        return (
          <div
            key={med.id}
            className="bg-white border rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span>💊</span> {med.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {med.dosage}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Prescrito: {limit}{' '}
                  {limit === 1 ? 'vez ao dia' : 'vezes ao dia'}
                </p>
              </div>
            </div>

            <div className="space-y-3">

              <h4 className="text-sm font-medium">
                Horários ({med.schedules.length}/{limit}):
              </h4>

              {/* Aviso de alteração da frequência */}
              {hasExcessSchedules && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-yellow-800">
                    ⚠️ Atenção: alteração na prescrição
                  </p>

                  <p className="text-sm text-yellow-800">
                    A frequência deste medicamento foi alterada.
                    Agora você precisa escolher qual horário deseja manter:
                  </p>

                  {med.schedules.map((schedule) => (
                    <button
                      key={schedule}
                      onClick={() =>
                        void handleKeepSchedule(med.id, schedule)
                      }
                      className="w-full px-3 py-2 border border-yellow-400 rounded-md bg-white hover:bg-yellow-100 text-sm"
                    >
                      Manter {schedule}
                    </button>
                  ))}
                </div>
              )}

              {/* Horários cadastrados */}
              {med.schedules.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Nenhum horário definido. Escolha seu horário de lembrete.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {med.schedules.map((schedule) => (
                    <div
                      key={schedule}
                      className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md"
                    >
                      <span className="text-sm font-medium">
                        {schedule}
                      </span>

                      <button
                        onClick={() =>
                          void handleRemoveSchedule(med.id, schedule)
                        }
                        aria-label={`Remover horário ${schedule}`}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar horário */}
              {!hasExcessSchedules && (
                editingMedId === med.id ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <input
                      type="time"
                      value={newSchedule}
                      onChange={(event) =>
                        setNewSchedule(event.target.value)
                      }
                      className="flex-1 min-w-[130px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={() => void handleAddSchedule(med.id)}
                      disabled={!newSchedule || !canAdd}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
                ) : canAdd ? (
                  <button
                    onClick={() => {
                      setEditingMedId(med.id);
                      setNewSchedule('');
                    }}
                    className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm"
                  >
                    ➕ Adicionar Horário
                  </button>
                ) : (
                  <p className="mt-3 text-sm text-green-700">
                    Todos os horários prescritos já foram configurados.
                  </p>
                )
              )}
            </div>
          </div>
        );
      })}

      {/* Informação sobre lembretes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>💡 Lembrete:</strong> Você receberá lembretes nesta tela
          15 minutos antes de cada horário, enquanto o DiabeCare estiver aberto.
        </p>
      </div>
    </div>
  );
}
