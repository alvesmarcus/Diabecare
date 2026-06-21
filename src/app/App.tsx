import { useState } from 'react';
import { LoginSimple as Login } from './components/loginSimple';
import { RegisterSimple as Register } from './components/registerSimple';
import { DashboardSimple as Dashboard } from './components/dashboardSimple';
import { DoctorDashboardSimple } from './components/DoctorDashboardSimple';

type AppState = 'login' | 'register' | 'dashboard' | 'doctor-dashboard' | 'role-select';
type UserType = 'paciente' | 'medico';

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
  senha: string;
}

interface Doctor {
  nome: string;
  crm: string;
  cpf: string;
  senha: string;
  especialidade?: string;
}

export interface CalendarEntry {
  id: string;
  date: string;
  type: 'glicemia' | 'consulta' | 'refeicao';
  time: string;
  value?: string;
  description: string;
  patientCpf: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  patientCpf: string;
  schedules: string[];
}

export interface ExamRequest {
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

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('role-select');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [currentUserCpf, setCurrentUserCpf] = useState<string>('');
  const [medicationRequests, setMedicationRequests] = useState<MedicationRequest[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 'med-01',
      name: 'Metformina',
      dosage: '500mg',
      patientCpf: '111.111.111-11',
      schedules: ['08:00', '20:00']
    }
  ]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([
    {
      nome: 'Maria Silva Santos',
      endereco: 'Rua das Flores, 123, Centro, Saquarema - RJ',
      cpf: '111.111.111-11',
      cartaoSus: '123 4567 8901 2345',
      senha: '123456'
    },
    {
      nome: 'João Pedro Oliveira',
      endereco: 'Av. Principal, 456, Bacaxá, Saquarema - RJ',
      cpf: '222.222.222-22',
      cartaoSus: '234 5678 9012 3456',
      senha: '123456'
    },
    {
      nome: 'Ana Paula Costa',
      endereco: 'Rua do Comércio, 789, Sampaio Correia, Saquarema - RJ',
      cpf: '333.333.333-33',
      cartaoSus: '345 6789 0123 4567',
      senha: '123456'
    }
  ]);

  const [registeredDoctors, setRegisteredDoctors] = useState<Doctor[]>([
    {
      nome: 'Dr. Carlos Silva',
      crm: '123456',
      cpf: '444.444.444-44',
      senha: '123456',
      especialidade: 'Endocrinologia'
    },
    {
      nome: 'Dra. Fernanda Costa',
      crm: '789012',
      cpf: '555.555.555-55',
      senha: '123456',
      especialidade: 'Nutrição'
    }
  ]);

  const [examRequests, setExamRequests] = useState<ExamRequest[]>([]);

  const handleLogin = (cpf: string, password: string) => {
    const user = registeredUsers.find(
      (item) => item.cpf === cpf && item.senha === password
    );

    if (!user) {
      alert('CPF ou senha inválidos. Verifique e tente novamente.');
      return;
    }

    setCurrentUser(user.nome);
    setCurrentUserCpf(user.cpf);
    setCurrentState('dashboard');
  };

  const handleDoctorLogin = (crm: string, password: string) => {
    const doctor = registeredDoctors.find(
      (item) => item.crm === crm && item.senha === password
    );

    if (!doctor) {
      alert('CRM ou senha inválidos. Verifique e tente novamente.');
      return;
    }

    setCurrentUser(doctor.nome);
    setCurrentUserCpf(doctor.cpf);
    setCurrentState('doctor-dashboard');
  };

  const handleUpdateRequestStatus = (requestId: string, status: MedicationRequest['status']) => {
    setMedicationRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status } : req
      )
    );
  };

  const handleAddMedication = (patientCpf: string, name: string, dosage: string) => {
    setMedications((prev) => [
      ...prev,
      {
        id: `med-${prev.length + 1}`,
        name,
        dosage,
        patientCpf,
        schedules: []
      }
    ]);
  };

  const handleUpdateMedication = (medicationId: string, name: string, dosage: string) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === medicationId ? { ...med, name, dosage } : med
      )
    );
  };

  const handleRemoveMedication = (medicationId: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== medicationId));
  };

  const handleRequestExam = (patientCpf: string, patientName: string, examType: string, description: string, scheduledDate: string, scheduledTime: string) => {
    setExamRequests((prev) => [
      ...prev,
      {
        id: `exam-${prev.length + 1}`,
        patientCpf,
        patientName,
        examType,
        description,
        requestedDate: new Date(),
        scheduledDate,
        scheduledTime,
        status: 'pending'
      }
    ]);
    alert('Solicitação de exame registrada com sucesso.');
  };

  const handleRegister = (userData: User) => {
    const exists = registeredUsers.some((user) => user.cpf === userData.cpf);

    if (exists) {
      alert('Já existe um usuário cadastrado com este CPF.');
      return;
    }

    setRegisteredUsers((prev) => [...prev, userData]);
    alert('Cadastro realizado com sucesso! Agora faça login.');
    setCurrentState('login');
  };

  const handleLogout = () => {
    setCurrentUser('');
    setCurrentUserCpf('');
    setUserType(null);
    setCurrentState('role-select');
  };

  const handleSelectRole = (role: UserType) => {
    setUserType(role);
    setCurrentState('login');
  };

  const handleMedicationRequest = (patientName: string, patientAddress: string) => {
    setMedicationRequests((prev) => [
      ...prev,
      {
        id: `req-${prev.length + 1}`,
        patientName,
        patientAddress,
        requestDate: new Date(),
        status: 'pending'
      }
    ]);

    alert('Solicitação de medicamento registrada com sucesso.');
  };

  const handleAddCalendarEntry = (entry: Omit<CalendarEntry, 'id' | 'patientCpf'>) => {
    if (!currentUserCpf) return;

    setCalendarEntries((prev) => [
      ...prev,
      {
        ...entry,
        id: `entry-${prev.length + 1}`,
        patientCpf: currentUserCpf
      }
    ]);
  };

  const handleUpdateMedicationSchedules = (medicationId: string, schedules: string[]) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === medicationId ? { ...med, schedules } : med
      )
    );
  };

  const currentView = () => {
    switch (currentState) {
      case 'role-select':
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  DC
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2 text-center">DiabeCare</h1>
              <p className="text-gray-600 text-center mb-8">Selecione seu tipo de acesso</p>
              
              <div className="space-y-4">
                <button
                  onClick={() => handleSelectRole('paciente')}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition"
                >
                  Acesso Paciente
                </button>
                <button
                  onClick={() => handleSelectRole('medico')}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg transition"
                >
                  Acesso Médico
                </button>
              </div>
            </div>
          </div>
        );
      case 'register':
        return (
          <Register
            onRegister={handleRegister}
            onBack={() => setCurrentState(userType === 'paciente' ? 'login' : 'role-select')}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            user={currentUser}
            userCpf={currentUserCpf}
            onLogout={handleLogout}
            onMedicationRequest={handleMedicationRequest}
            calendarEntries={calendarEntries}
            onAddCalendarEntry={handleAddCalendarEntry}
            medications={medications}
            onUpdateMedicationSchedules={handleUpdateMedicationSchedules}
          />
        );
      case 'doctor-dashboard':
        return (
          <DoctorDashboardSimple
            onLogout={handleLogout}
            medicationRequests={medicationRequests}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            registeredUsers={registeredUsers}
            onAddMedication={handleAddMedication}
            onUpdateMedication={handleUpdateMedication}
            onRemoveMedication={handleRemoveMedication}
            medications={medications}
            calendarEntries={calendarEntries}
            onRequestExam={handleRequestExam}
            examRequests={examRequests}
          />
        );
      default:
        return (
          <Login
            onLogin={userType === 'medico' ? handleDoctorLogin : handleLogin}
            onNavigateToRegister={() => userType === 'paciente' && setCurrentState('register')}
            onNavigateBack={() => setCurrentState('role-select')}
            isDoctorLogin={userType === 'medico'}
          />
        );
    }
  };

  return <>{currentView()}</>;
}