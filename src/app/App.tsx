import { useEffect, useState } from 'react';
import { LoginSimple as Login } from './components/loginSimple';
import { RegisterSimple as Register } from './components/registerSimple';
import { DashboardSimple as Dashboard } from './components/dashboardSimple';
import { DoctorDashboardSimple } from './components/DoctorDashboardSimple';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type AppState = 'login' | 'register' | 'dashboard' | 'doctor-dashboard' | 'role-select';
type UserType = 'paciente' | 'medico';

type AppHistoryState = {
  diabecareApp: true;
  appState: AppState;
};

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
  senha?: string;
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
  vezesPorDia: number;
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

const VALID_APP_STATES: AppState[] = [
  'login',
  'register',
  'dashboard',
  'doctor-dashboard',
  'role-select'
];

function isAppHistoryState(value: unknown): value is AppHistoryState {
  if (!value || typeof value !== 'object') return false;

  const state = value as Partial<AppHistoryState>;
  return state.diabecareApp === true &&
    typeof state.appState === 'string' &&
    VALID_APP_STATES.includes(state.appState as AppState);
}

async function readApiResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Erro na API (${response.status}).`);
  }
  return data;
}

function normalizeMedication(item: any): Medication {
  return {
    id: String(item.id),
    name: item.name,
    dosage: item.dosage,
    patientCpf: item.patientCpf,
    schedules: Array.isArray(item.schedules) ? item.schedules : [],
    vezesPorDia: Number(item.vezesPorDia ?? item.vezes_por_dia ?? 1),
  };
}

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('role-select');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [currentUserCpf, setCurrentUserCpf] = useState<string>('');

  // Navega entre as telas principais e registra cada etapa no histórico do navegador.
  const navigateApp = (nextState: AppState, replace = false) => {
    const historyState: AppHistoryState = {
      diabecareApp: true,
      appState: nextState
    };

    if (replace) {
      window.history.replaceState(historyState, '');
    } else {
      window.history.pushState(historyState, '');
    }

    setCurrentState(nextState);
  };

  // Ao abrir ou atualizar o aplicativo, exige uma nova autenticação.
  // A sessão anterior não deve restaurar automaticamente o painel do paciente/médico.
  useEffect(() => {
    localStorage.removeItem('diabecare-session');
    setUserType(null);
    setCurrentUser('');
    setCurrentUserCpf('');

    const initialState: AppState = 'role-select';

    // Define a tela inicial sem criar uma entrada falsa no histórico.
    window.history.replaceState(
      { diabecareApp: true, appState: initialState } satisfies AppHistoryState,
      ''
    );
    setCurrentState(initialState);

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as
        | (AppHistoryState & { dashboardScreen?: string })
        | { diabecareDashboard?: string; screen?: string }
        | null;

      if (isAppHistoryState(state)) {
        // Ao voltar para a tela de login, encerra a sessão anterior.
        // Assim, avançar no navegador não reabre a conta sem autenticação.
        if (state.appState === 'login') {
          localStorage.removeItem('diabecare-session');
          setUserType(null);
          setCurrentUser('');
          setCurrentUserCpf('');
          setCurrentState('login');
          return;
        }

        // Impede que Voltar/Avançar restaure um painel sem uma sessão válida.
        if (state.appState === 'dashboard' || state.appState === 'doctor-dashboard') {
          const savedSession = localStorage.getItem('diabecare-session');

          if (!savedSession) {
            const loginState: AppHistoryState = {
              diabecareApp: true,
              appState: 'login'
            };
            window.history.replaceState(loginState, '');
            setUserType(null);
            setCurrentUser('');
            setCurrentUserCpf('');
            setCurrentState('login');
            return;
          }
        }

        setCurrentState(state.appState);
        return;
      }

      // Compatibilidade com o histórico criado pelo dashboardSimple.tsx atual.
      // O painel do paciente usa este formato nas entradas das telas internas.
      if (
        state &&
        'diabecareDashboard' in state &&
        state.diabecareDashboard === 'patient'
      ) {
        if (localStorage.getItem('diabecare-session')) {
          setCurrentState('dashboard');
        } else {
          window.history.replaceState(
            { diabecareApp: true, appState: 'role-select' } satisfies AppHistoryState,
            ''
          );
          setCurrentState('role-select');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [medicationRequests, setMedicationRequests] = useState<MedicationRequest[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);


  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  const [registeredDoctors] = useState<Doctor[]>([
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

  const loadMedicationsForPatient = async (patientCpf: string) => {
    const response = await fetch(
      `${API_URL}/medications?patientCpf=${encodeURIComponent(patientCpf)}`
    );
    const data = await readApiResponse(response);
    return (Array.isArray(data) ? data : data.value || []).map(normalizeMedication);
  };

  
  useEffect(() => {
    if (currentState === 'dashboard' && currentUserCpf) {
      loadMedicationsForPatient(currentUserCpf)
        .then(setMedications)
        .catch((error) => {
          console.error('Erro ao carregar medicamentos:', error);
          alert(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os medicamentos.'
          );
        });
    }

    if (currentState === 'doctor-dashboard') {
      const loadDoctorData = async () => {
        try {
          // Busca os pacientes cadastrados no banco
          const response = await fetch(`${API_URL}/patients`);
          const data = await readApiResponse(response);

          const patients: User[] = (
            Array.isArray(data) ? data : []
          ).map((patient: any) => ({
            nome: patient.nome,
            endereco: patient.endereco,
            cpf: patient.cpf,
            cartaoSus: patient.cartaoSus ?? patient.cartao_sus ?? ''
          }));

          setRegisteredUsers(patients);

          // Busca os medicamentos de cada paciente
          const medicationLists = await Promise.all(
            patients.map((patient) =>
              loadMedicationsForPatient(patient.cpf)
            )
          );

          setMedications(medicationLists.flat());
        } catch (error) {
          console.error('Erro ao carregar dados dos pacientes:', error);

          alert(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os pacientes.'
          );
        }
      };

      loadDoctorData();
    }
  }, [currentState, currentUserCpf]);

  const handleLogin = async (cpf: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cpf, password })
      });
      const data = await readApiResponse(response);

      localStorage.setItem(
        'diabecare-session',
        JSON.stringify({
          userType: 'paciente',
          currentUser: data.user.nome,
          currentUserCpf: data.user.cpf
        })
      );

      setUserType('paciente');
      setCurrentUser(data.user.nome);
      setCurrentUserCpf(data.user.cpf);
      navigateApp('dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      alert(error instanceof Error ? error.message : 'Não foi possível conectar ao servidor.');
    }
  };

  const handleDoctorLogin = (crm: string, password: string) => {
    const doctor = registeredDoctors.find((item) => item.crm === crm && item.senha === password);
    if (!doctor) {
      alert('CRM ou senha inválidos. Verifique e tente novamente.');
      return;
    }

    localStorage.setItem(
      'diabecare-session',
      JSON.stringify({
        userType: 'medico',
        currentUser: doctor.nome,
        currentUserCpf: doctor.cpf
      })
    );

    setUserType('medico');
    setCurrentUser(doctor.nome);
    setCurrentUserCpf(doctor.cpf);
    navigateApp('doctor-dashboard');
  };

  const handleUpdateRequestStatus = (requestId: string, status: MedicationRequest['status']) => {
    setMedicationRequests((prev) =>
      prev.map((req) => req.id === requestId ? { ...req, status } : req)
    );
  };

  const handleAddMedication = async (
    patientCpf: string,
    name: string,
    dosage: string,
    vezesPorDia: number
  ) => {
    try {
      const response = await fetch(`${API_URL}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientCpf, name, dosage, schedules: [], vezesPorDia })
      });
      const data = await readApiResponse(response);
      const savedMedication = normalizeMedication(data.medication || data);
      setMedications((prev) => [...prev, savedMedication]);
      alert('Medicamento prescrito e salvo com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);
      alert(error instanceof Error ? error.message : 'Não foi possível salvar o medicamento.');
    }
  };

  const handleUpdateMedication = async (
    medicationId: string,
    name: string,
    dosage: string,
    vezesPorDia: number
  ) => {
    try {
      const response = await fetch(`${API_URL}/medications/${encodeURIComponent(medicationId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Não enviar schedules aqui: a edição médica deve preservar os horários do paciente.
        body: JSON.stringify({ name, dosage, vezesPorDia })
      });
      const data = await readApiResponse(response);
      const updatedMedication = normalizeMedication(data.medication || data);
      setMedications((prev) =>
        prev.map((med) => med.id === medicationId ? updatedMedication : med)
      );
      alert('Prescrição atualizada com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar medicamento:', error);
      alert(error instanceof Error ? error.message : 'Não foi possível atualizar o medicamento.');
    }
  };

  const handleRemoveMedication = async (medicationId: string) => {
    try {
      const response = await fetch(`${API_URL}/medications/${encodeURIComponent(medicationId)}`, {
        method: 'DELETE'
      });
      await readApiResponse(response);
      setMedications((prev) => prev.filter((med) => med.id !== medicationId));
      alert('Medicamento removido com sucesso.');
    } catch (error) {
      console.error('Erro ao remover medicamento:', error);
      alert(error instanceof Error ? error.message : 'Não foi possível remover o medicamento.');
    }
  };

  const handleRequestExam = (
    patientCpf: string,
    patientName: string,
    examType: string,
    description: string,
    scheduledDate: string,
    scheduledTime: string
  ) => {
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

  const handleRegister = async (userData: User) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: userData.nome,
          endereco: userData.endereco,
          cpf: userData.cpf,
          cartaoSus: userData.cartaoSus,
          senha: userData.senha
        })
      });
      await readApiResponse(response);
      alert('Cadastro realizado com sucesso! Agora faça login.');
      navigateApp('login');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      alert(error instanceof Error ? error.message : 'Não foi possível conectar ao servidor.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('diabecare-session');
    setCurrentUser('');
    setCurrentUserCpf('');
    setMedications([]);
    setUserType(null);

    // Substitui a entrada atual para não permitir voltar ao painel autenticado.
    navigateApp('role-select', true);
  };

  const handleSelectRole = (role: UserType) => {
    setUserType(role);
    navigateApp('login');
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
      { ...entry, id: `entry-${prev.length + 1}`, patientCpf: currentUserCpf }
    ]);
  };

  const handleUpdateMedicationSchedules = async (medicationId: string, schedules: string[]) => {
    try {
      const response = await fetch(`${API_URL}/medications/${encodeURIComponent(medicationId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Enviar somente horários para não alterar a prescrição médica.
        body: JSON.stringify({ schedules })
      });
      const data = await readApiResponse(response);
      const updatedMedication = normalizeMedication(data.medication || data);
      setMedications((prev) =>
        prev.map((med) => med.id === medicationId ? updatedMedication : med)
      );
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      alert(error instanceof Error ? error.message : 'Não foi possível salvar os horários.');
    }
  };

  const currentView = () => {
    switch (currentState) {
      case 'role-select':
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">DC</div>
              </div>
              <h1 className="text-3xl font-bold mb-2 text-center">DiabeCare</h1>
              <p className="text-gray-600 text-center mb-8">Selecione seu tipo de acesso</p>
              <div className="space-y-4">
                <button onClick={() => handleSelectRole('paciente')} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition">Acesso Paciente</button>
                <button onClick={() => handleSelectRole('medico')} className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg transition">Acesso Médico</button>
              </div>
            </div>
          </div>
        );

      case 'register':
        return (
          <Register
            onRegister={handleRegister}
            onBack={() => navigateApp(userType === 'paciente' ? 'login' : 'role-select')}
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
            onNavigateToRegister={() => {
              if (userType === 'paciente') navigateApp('register');
            }}
            onNavigateBack={() => navigateApp('role-select')}
            isDoctorLogin={userType === 'medico'}
          />
        );
    }
  };

  return <>{currentView()}</>;
}
