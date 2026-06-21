import { useState } from 'react';

interface RegisterProps {
  onRegister: (userData: any) => void;
  onBack: () => void;
}

export function RegisterSimple({ onRegister, onBack }: RegisterProps) {
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    cpf: '',
    cartaoSus: '',
    senha: '',
    confirmarSenha: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);
    
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    if (limited.length <= 9) return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
  };

  const formatCartaoSUS = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 15);
    
    if (limited.length <= 3) return limited;
    if (limited.length <= 7) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    if (limited.length <= 11) return `${limited.slice(0, 3)} ${limited.slice(3, 7)} ${limited.slice(7)}`;
    return `${limited.slice(0, 3)} ${limited.slice(3, 7)} ${limited.slice(7, 11)} ${limited.slice(11)}`;
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const handleCartaoSUSChange = (value: string) => {
    const formatted = formatCartaoSUS(value);
    setFormData(prev => ({ ...prev, cartaoSus: formatted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cpfDigits = formData.cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      alert('CPF deve conter 11 dígitos');
      return;
    }
    
    const susDigits = formData.cartaoSus.replace(/\D/g, '');
    if (susDigits.length !== 15) {
      alert('Cartão SUS deve conter 15 dígitos');
      return;
    }
    
    if (formData.senha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }
    
    onRegister(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              DC
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center">Criar Cadastro</h2>
          <p className="text-sm text-gray-500 text-center">Preencha os dados para se cadastrar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome Completo</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="João Silva"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Endereço</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Rua, número, bairro, cidade"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">CPF</label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => handleCPFChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
            <p className="text-xs text-gray-500 mt-1">11 dígitos</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cartão SUS</label>
            <input
              type="text"
              value={formData.cartaoSus}
              onChange={(e) => handleCartaoSUSChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="000 0000 0000 0000"
              maxLength={18}
              required
            />
            <p className="text-xs text-gray-500 mt-1">15 dígitos</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              value={formData.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirmar Senha</label>
            <input
              type="password"
              value={formData.confirmarSenha}
              onChange={(e) => handleChange('confirmarSenha', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite a senha novamente"
              minLength={6}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}