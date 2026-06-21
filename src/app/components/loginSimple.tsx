import { useState } from 'react';

interface LoginProps {
  onLogin: (cpfOrCrm: string, password: string) => void;
  onNavigateToRegister: () => void;
  onNavigateBack: () => void;
  isDoctorLogin?: boolean;
}


export function LoginSimple({ onLogin, onNavigateToRegister, onNavigateBack, isDoctorLogin = false }: LoginProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);
    
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    if (limited.length <= 9) return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
  };

  const formatCRM = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 6);
  };

  const handleIdentifierChange = (value: string) => {
    if (isDoctorLogin) {
      const formatted = formatCRM(value);
      setIdentifier(formatted);
    } else {
      const formatted = formatCPF(value);
      setIdentifier(formatted);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier && password) {
      onLogin(identifier, password);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Email de recuperação enviado para: ${email}`);
    setShowForgotPassword(false);
    setEmail('');
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              DC
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center">Recuperar Senha</h2>
          <p className="text-sm text-gray-500 mb-6">
            Digite seu email para receber instruções de recuperação
          </p>
          
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`h-20 w-20 ${isDoctorLogin ? 'bg-green-600' : 'bg-blue-600'} rounded-full flex items-center justify-center text-white text-3xl font-bold`}>
              DC
            </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">DiabeCare</h1>
          <p className="text-gray-500">{isDoctorLogin ? 'Painel Médico' : 'Cuidando da sua saúde'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {isDoctorLogin ? 'CRM' : 'CPF'}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isDoctorLogin ? '000000' : '000.000.000-00'}
              maxLength={isDoctorLogin ? 6 : 14}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Esqueci minha senha
          </button>

          <button
            type="submit"
            className={`w-full px-4 py-2 ${isDoctorLogin ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md font-medium`}
          >
            Entrar
          </button>

          {!isDoctorLogin && (
            <div className="text-center">
              <span className="text-sm text-gray-500">Não tem uma conta? </span>
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Criar cadastro
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onNavigateBack}
            className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium text-gray-700"
          >
            ← Voltar
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>💡 Dica:</strong> {isDoctorLogin ? 'Use CRM "123456" e senha "123456"' : 'Use CPF "111.111.111-11" e senha "123456"'}
          </p>
        </div>
      </div>
    </div>
  );
}

