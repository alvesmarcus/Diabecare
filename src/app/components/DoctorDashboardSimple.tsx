import { useState } from 'react';
import { PatientCalendarView } from './PatientCalendarView';

export interface MedicationRequest {
  id: string;
  patientName: string;
  patientAddress: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'delivered';
}

interface User {
  nome: string;
  endereco: string;
  cpf: string;
  cartaoSus: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  patientCpf: string;
  schedules: string[];
}

interface CalendarEntry {
  id: string;
  date: string;
  type: 'glicemia' | 'consulta' | 'refeicao';
  time: string;
  value?: string;
  description: string;
  patientCpf: string;
}

interface ExamRequest {
  id: string;
  patientCpf: string;
  patientName: string;
  examType: string;
  description: string;
  requestedDate: Date;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'scheduled' | 'completed';
}

interface DoctorDashboardProps {
  onLogout: () => void;
  medicationRequests: MedicationRequest[];
  onUpdateRequestStatus: (requestId: string, status: MedicationRequest['status']) => void;
  registeredUsers: User[];
  onAddMedication: (patientCpf: string, name: string, dosage: string) => void;
  onUpdateMedication: (medicationId: string, name: string, dosage: string) => void;
  onRemoveMedication: (medicationId: string) => void;
  medications: Medication[];
  calendarEntries: CalendarEntry[];
  onRequestExam: (patientCpf: string, patientName: string, examType: string, description: string, scheduledDate: string, scheduledTime: string) => void;
  examRequests: ExamRequest[];
}

export function DoctorDashboardSimple({ 
  onLogout, 
  medicationRequests, 
  onUpdateRequestStatus,
  registeredUsers,
  onAddMedication,
  onUpdateMedication,
  onRemoveMedication,
  medications,
  calendarEntries,
  onRequestExam,
  examRequests
}: DoctorDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showEditMedicationDialog, setShowEditMedicationDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [prescriptionData, setPrescriptionData] = useState({
    medicationName: '',
    dosage: ''
  });
  const [examData, setExamData] = useState({
    examType: '',
    description: '',
    scheduledDate: '',
    scheduledTime: ''
  });

  const calculateBusinessDaysRemaining = (requestDate: Date): number => {
    const start = new Date(requestDate);
    const today = new Date();
    const deliveryDate = new Date(start);
    
    let daysToAdd = 5;
    while (daysToAdd > 0) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      const dayOfWeek = deliveryDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysToAdd--;
      }
    }
    
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const formatRequestDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateGlycemiaAverage = (patientCpf: string): number | null => {
    const patientGlycemias = calendarEntries.filter(
      entry => entry.patientCpf === patientCpf && entry.type === 'glicemia' && entry.value
    );

    if (patientGlycemias.length === 0) return null;

    const sum = patientGlycemias.reduce((acc, entry) => acc + parseInt(entry.value!), 0);
    return Math.round(sum / patientGlycemias.length);
  };

  const getGlycemiaColor = (average: number) => {
    if (average > 300) return 'text-red-600';
    if (average > 200) return 'text-orange-600';
    if (average > 99) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getGlycemiaStatus = (average: number) => {
    if (average > 300) return 'Crítico';
    if (average > 200) return 'Alta';
    if (average > 99) return 'Alterada';
    return 'Normal';
  };

  const getTodayHighestGlycemia = (patientCpf: string): number | null => {
    const today = new Date().toISOString().split('T')[0];
    const todayGlycemias = calendarEntries.filter(
      entry => entry.patientCpf === patientCpf && 
               entry.type === 'glicemia' && 
               entry.value && 
               entry.date === today
    );

    if (todayGlycemias.length === 0) return null;

    const values = todayGlycemias.map(e => parseInt(e.value!));
    return Math.max(...values);
  };

  const allPatients = registeredUsers.map((u, idx) => ({
    id: `patient-${idx}`,
    nome: u.nome,
    cpf: u.cpf,
    cartaoSus: u.cartaoSus,
    endereco: u.endereco,
    medicacoes: []
  }));

  const filteredPatients = allPatients.filter(patient =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm)
  );

  const pendingRequests = medicationRequests.filter(r => r.status === 'pending').length;

  const handlePrescribe = (patient: typeof allPatients[0]) => {
    const user = registeredUsers.find(u => u.cpf === patient.cpf);
    if (user) {
      setSelectedPatient(user);
      setShowPrescriptionDialog(true);
    }
  };

  const handleRequestExam = (patient: typeof allPatients[0]) => {
    const user = registeredUsers.find(u => u.cpf === patient.cpf);
    if (user) {
      setSelectedPatient(user);
      setShowExamDialog(true);
    }
  };

  const handleSubmitPrescription = () => {
    if (!selectedPatient || !prescriptionData.medicationName || !prescriptionData.dosage) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const currentMeds = getPatientMedications(selectedPatient.cpf);
    
    onAddMedication(selectedPatient.cpf, prescriptionData.medicationName, prescriptionData.dosage);
    alert(`Medicamento ${prescriptionData.medicationName} prescrito com sucesso!`);
    
    setShowPrescriptionDialog(false);
    setSelectedPatient(null);
    setPrescriptionData({ medicationName: '', dosage: '' });
  };

  const handleSubmitExam = () => {
    if (!selectedPatient || !examData.examType || !examData.scheduledDate || !examData.scheduledTime) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    onRequestExam(
      selectedPatient.cpf,
      selectedPatient.nome,
      examData.examType,
      examData.description,
      examData.scheduledDate,
      examData.scheduledTime
    );
    
    alert(`Exame ${examData.examType} agendado com sucesso!`);
    
    setShowExamDialog(false);
    setSelectedPatient(null);
    setExamData({ examType: '', description: '', scheduledDate: '', scheduledTime: '' });
  };

  const getPatientMedications = (cpf: string) => {
    return medications.filter(m => m.patientCpf === cpf);
  };

  const handleEditMedication = (medication: Medication, patient: User) => {
    setSelectedMedication(medication);
    setSelectedPatient(patient);
    setPrescriptionData({
      medicationName: medication.name,
      dosage: medication.dosage
    });
    setShowEditMedicationDialog(true);
  };

  const handleUpdateMedication = () => {
    if (!selectedMedication || !prescriptionData.medicationName || !prescriptionData.dosage) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    onUpdateMedication(selectedMedication.id, prescriptionData.medicationName, prescriptionData.dosage);
    alert('Medicamento atualizado com sucesso!');
    
    setShowEditMedicationDialog(false);
    setSelectedMedication(null);
    setSelectedPatient(null);
    setPrescriptionData({ medicationName: '', dosage: '' });
  };

  const handleRemoveMedication = (medicationId: string, medicationName: string) => {
    if (confirm(`Tem certeza que deseja remover "${medicationName}"?`)) {
      onRemoveMedication(medicationId);
      alert('Medicamento removido!');
    }
  };
   return (
    <div className="min-h-screen bg-gray-50">
      {showCalendarView && (
        <PatientCalendarView
          patients={registeredUsers}
          calendarEntries={calendarEntries}
          onClose={() => setShowCalendarView(false)}
        />
      )}

      {showExamDialog && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-2">Solicitar Exame</h3>
            <p className="text-sm text-gray-500 mb-4">Paciente: {selectedPatient.nome}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Exame *</label>
                <select
                  value={examData.examType}
                  onChange={(e) => setExamData(prev => ({ ...prev, examType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Hemoglobina Glicada (HbA1c)">Hemoglobina Glicada (HbA1c)</option>
                  <option value="Glicemia em Jejum">Glicemia em Jejum</option>
                  <option value="Curva Glicêmica">Curva Glicêmica</option>
                  <option value="Colesterol Total">Colesterol Total</option>
                  <option value="Triglicerídeos">Triglicerídeos</option>
                  <option value="Função Renal">Função Renal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Observações</label>
                <textarea
                  value={examData.description}
                  onChange={(e) => setExamData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
                  placeholder="Informações adicionais..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data Agendada *</label>
                <input
                  type="date"
                  value={examData.scheduledDate}
                  onChange={(e) => setExamData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Horário *</label>
                <input
                  type="time"
                  value={examData.scheduledTime}
                  onChange={(e) => setExamData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowExamDialog(false);
                    setSelectedPatient(null);
                    setExamData({ examType: '', description: '', scheduledDate: '', scheduledTime: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitExam}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Agendar Exame
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPrescriptionDialog && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-2">Prescrever Medicamento</h3>
            <p className="text-sm text-gray-500 mb-4">Paciente: {selectedPatient.nome}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Medicamento *</label>
                <input
                  type="text"
                  value={prescriptionData.medicationName}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, medicationName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Metformina"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dosagem *</label>
                <input
                  type="text"
                  value={prescriptionData.dosage}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, dosage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 850mg - 2x ao dia"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowPrescriptionDialog(false);
                    setSelectedPatient(null);
                    setPrescriptionData({ medicationName: '', dosage: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitPrescription}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Prescrever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditMedicationDialog && selectedPatient && selectedMedication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-2">Editar Medicamento</h3>
            <p className="text-sm text-gray-500 mb-4">Paciente: {selectedPatient.nome}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Medicamento *</label>
                <input
                  type="text"
                  value={prescriptionData.medicationName}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, medicationName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dosagem *</label>
                <input
                  type="text"
                  value={prescriptionData.dosage}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, dosage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowEditMedicationDialog(false);
                    setSelectedPatient(null);
                    setSelectedMedication(null);
                    setPrescriptionData({ medicationName: '', dosage: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateMedication}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Salvar
                </button>
              </div>
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
                <h1 className="text-lg font-semibold">DiabeCare - Área Médica</h1>
                <p className="text-sm text-gray-500">Painel de Gerenciamento</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {medicationRequests.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Solicitações de Medicamentos</h2>
              <div className="space-y-3">
                {medicationRequests.map((request) => {
                  const daysRemaining = calculateBusinessDaysRemaining(request.requestDate);
                  
                  return (
                    <div key={request.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{request.patientName}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {request.status === 'pending' ? 'Pendente' :
                               request.status === 'approved' ? 'Aprovado' : 'Entregue'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Data: {formatRequestDate(request.requestDate)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Endereço: {request.patientAddress}
                          </p>
                          <p className="text-sm text-orange-600 mt-2">
                            Prazo: {daysRemaining} dias úteis restantes
                          </p>
                        </div>
                        {request.status === 'pending' && (
                          <button
                            onClick={() => onUpdateRequestStatus(request.id, 'approved')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Aprovar
                          </button>
                        )}
                        {request.status === 'approved' && (
                          <button
                            onClick={() => onUpdateRequestStatus(request.id, 'delivered')}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                          >
                            Marcar Entregue
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Total de Pacientes</h3>
              <div className="text-3xl font-bold text-blue-600">{allPatients.length}</div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Medicações Ativas</h3>
              <div className="text-3xl font-bold text-purple-600">{medications.length}</div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Exames Agendados</h3>
              <div className="text-3xl font-bold text-orange-600">{examRequests.length}</div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Solicitações</h3>
              <div className="text-3xl font-bold text-green-600">{medicationRequests.length}</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Calendário dos Pacientes</h3>
                <p className="text-sm text-gray-600">Visualize registros de glicemia, consultas e refeições</p>
              </div>
              <button
                onClick={() => setShowCalendarView(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ver Calendários
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Lista de Pacientes</h3>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="🔍 Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              {filteredPatients.map((patient) => {
                const patientMeds = getPatientMedications(patient.cpf);
                const avgGlycemia = calculateGlycemiaAverage(patient.cpf);
                const highestToday = getTodayHighestGlycemia(patient.cpf);
                
                return (
                  <div key={patient.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-semibold">{patient.nome}</h4>
                            {avgGlycemia !== null && (
                              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                                <span className="text-xs text-gray-600">Média:</span>
                                <span className={`font-bold ${getGlycemiaColor(avgGlycemia)}`}>
                                  {avgGlycemia} mg/dL
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-200">
                                  {getGlycemiaStatus(avgGlycemia)}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            CPF: {patient.cpf} | SUS: {patient.cartaoSus}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRequestExam(patient)}
                            className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                          >
                            🔬 Exame
                          </button>
                          <button
                            onClick={() => handlePrescribe(patient)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            💊 Prescrever
                          </button>
                        </div>
                      </div>

                      {highestToday !== null && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium">MAIOR ÍNDICE HOJE</p>
                              <p className="text-sm text-gray-500">Medido pelo paciente</p>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getGlycemiaColor(highestToday)}`}>
                                {highestToday}
                              </div>
                              <div className="text-xs">mg/dL</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Medicações ({patientMeds.length})
                        </p>
                        {patientMeds.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">Nenhuma medicação prescrita</p>
                        ) : (
                          <div className="space-y-2">
                            {patientMeds.map((med) => (
                              <div key={med.id} className="flex items-center justify-between bg-purple-50 p-2 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium">{med.name}</p>
                                  <p className="text-xs text-gray-500">{med.dosage}</p>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      const user = registeredUsers.find(u => u.cpf === patient.cpf);
                                      if (user) handleEditMedication(med, user);
                                    }}
                                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleRemoveMedication(med.id, med.name)}
                                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPatients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum paciente encontrado
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}