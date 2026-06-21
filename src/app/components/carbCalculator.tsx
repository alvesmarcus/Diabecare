import { useState } from 'react';
import { Calculator } from 'lucide-react';

export function CarbCalculator() {
  const [ricInsulin, setRicInsulin] = useState<string>('');
  const [ricCarbs, setRicCarbs] = useState<string>('');
  const [carbsIngested, setCarbsIngested] = useState<string>('');
  const [currentGlucose, setCurrentGlucose] = useState<string>('');
  const [targetGlucose, setTargetGlucose] = useState<string>('');
  const [result, setResult] = useState<{
    insulinDose: number;
    correctionDose?: number;
    totalDose?: number;
  } | null>(null);

  const calculateInsulin = () => {
    // Validar campos obrigatórios
    if (!ricInsulin || !ricCarbs || !carbsIngested) {
      alert('Por favor, preencha todos os campos obrigatórios (RIC e Carboidratos Ingeridos)');
      return;
    }

    const insulinValue = parseFloat(ricInsulin);
    const carbsValue = parseFloat(ricCarbs);
    const ingestedValue = parseFloat(carbsIngested);

    if (insulinValue <= 0 || carbsValue <= 0 || ingestedValue < 0) {
      alert('Por favor, insira valores válidos (maiores que zero)');
      return;
    }

    // Calcular RIC (relação insulina/carboidrato)
    const ric = carbsValue / insulinValue;

    // Fórmula: Quantidade de insulina = quantidade de carboidratos / RIC
    const insulinDose = ingestedValue / ric;

    let correctionDose: number | undefined = undefined;
    let totalDose: number | undefined = undefined;

    // Se informou glicemia atual e alvo, calcular dose de correção
    if (currentGlucose && targetGlucose) {
      const currentValue = parseFloat(currentGlucose);
      const targetValue = parseFloat(targetGlucose);

      if (currentValue > 0 && targetValue > 0) {
        // Fórmula: Dose de correção = (glicemia atual - glicemia alvo) / Quantidade de insulina
        correctionDose = (currentValue - targetValue) / insulinDose;
        totalDose = insulinDose + correctionDose;
      }
    }

    setResult({
      insulinDose,
      correctionDose,
      totalDose
    });
  };

  const resetCalculator = () => {
    setRicInsulin('');
    setRicCarbs('');
    setCarbsIngested('');
    setCurrentGlucose('');
    setTargetGlucose('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          Calculadora de Carboidratos
        </h2>
        <p className="text-gray-500 mt-1">
          Calcule a dose de insulina necessária com base nos carboidratos ingeridos
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-6">
        {/* RIC - Relação Insulina/Carboidrato */}
        <div>
          <h3 className="font-semibold mb-4 text-blue-900">
            RIC - Relação Insulina/Carboidrato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">
                Dose de Insulina (unidades) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={ricInsulin}
                onChange={(e) => setRicInsulin(e.target.value)}
                placeholder="Ex: 1"
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">
                Para cada X gramas de Carboidrato <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={ricCarbs}
                onChange={(e) => setRicCarbs(e.target.value)}
                placeholder="Ex: 15"
                step="1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {ricInsulin && ricCarbs && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-900">
                <strong>Sua relação:</strong> {ricInsulin} unidade(s) de insulina para cada {ricCarbs}g de carboidrato
              </p>
            </div>
          )}
        </div>

        {/* Carboidratos Ingeridos */}
        <div>
          <h3 className="font-semibold mb-4 text-blue-900">
            Carboidratos Ingeridos
          </h3>
          <div>
            <label className="block text-sm mb-2">
              Quantidade em gramas <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={carbsIngested}
              onChange={(e) => setCarbsIngested(e.target.value)}
              placeholder="Ex: 45"
              step="1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Glicemia (Opcional) */}
        <div>
          <h3 className="font-semibold mb-4 text-blue-900">
            Correção de Glicemia (Opcional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">
                Glicemia Atual (mg/dL)
              </label>
              <input
                type="number"
                value={currentGlucose}
                onChange={(e) => setCurrentGlucose(e.target.value)}
                placeholder="Ex: 180"
                step="1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">
                Glicemia Alvo (mg/dL)
              </label>
              <input
                type="number"
                value={targetGlucose}
                onChange={(e) => setTargetGlucose(e.target.value)}
                placeholder="Ex: 100"
                step="1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {(currentGlucose || targetGlucose) && (!currentGlucose || !targetGlucose) && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Para calcular a dose de correção, preencha ambos os campos de glicemia (atual e alvo)
              </p>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={calculateInsulin}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Calcular
          </button>
          <button
            onClick={resetCalculator}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpar
          </button>
        </div>

        {/* Resultado */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 text-green-900">
                📊 Resultado do Cálculo
              </h3>
              
              <div className="space-y-3">
                {/* Dose de Insulina para Carboidratos */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 mb-1">Dose de insulina para carboidratos:</p>
                  <p className="text-2xl font-bold text-green-900">
                    {result.insulinDose.toFixed(2)} unidades
                  </p>
                </div>

                {/* Dose de Correção (se aplicável) */}
                {result.correctionDose !== undefined && (
                  <>
                    <div className={`p-4 rounded-lg border ${
                      result.correctionDose > 0 
                        ? 'bg-orange-50 border-orange-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className={`text-sm mb-1 ${
                        result.correctionDose > 0 ? 'text-orange-700' : 'text-blue-700'
                      }`}>
                        Dose de correção de glicemia:
                      </p>
                      <p className={`text-2xl font-bold ${
                        result.correctionDose > 0 ? 'text-orange-900' : 'text-blue-900'
                      }`}>
                        {result.correctionDose > 0 ? '+' : ''}{result.correctionDose.toFixed(2)} unidades
                      </p>
                      {result.correctionDose < 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          ⚠️ Valor negativo indica que não é necessária dose de correção adicional
                        </p>
                      )}
                    </div>

                    {/* Dose Total */}
                    <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
                      <p className="text-sm mb-1 opacity-90">
                        <strong>DOSE TOTAL DE INSULINA:</strong>
                      </p>
                      <p className="text-3xl font-bold">
                        {result.totalDose && result.totalDose > 0 
                          ? result.totalDose.toFixed(2) 
                          : result.insulinDose.toFixed(2)} unidades
                      </p>
                      <p className="text-xs mt-2 opacity-80">
                        {result.correctionDose > 0 
                          ? `(${result.insulinDose.toFixed(2)} para carboidratos + ${result.correctionDose.toFixed(2)} de correção)`
                          : '(Apenas dose para carboidratos)'
                        }
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Aviso Importante */}
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>⚠️ IMPORTANTE:</strong> Este é apenas um cálculo orientativo. 
                  Sempre consulte seu médico antes de aplicar insulina. Em caso de dúvidas 
                  ou valores muito altos/baixos, entre em contato com seu médico imediatamente.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Informações Adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-3 text-blue-900">
          💡 Como usar a calculadora
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">1.</span>
            <span>Informe sua relação insulina/carboidrato (RIC) prescrita pelo seu médico</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">2.</span>
            <span>Digite quantos gramas de carboidratos você vai consumir na refeição</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">3.</span>
            <span>Opcionalmente, informe sua glicemia atual e alvo para calcular dose de correção</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">4.</span>
            <span>Clique em "Calcular" para obter a dose recomendada de insulina</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
