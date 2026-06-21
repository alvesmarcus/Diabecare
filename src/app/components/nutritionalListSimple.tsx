import { useState } from 'react';

interface Food {
  id: string;
  name: string;
  category: string;
  glycemicIndex: number;
  glycemicLoad: 'baixa' | 'media' | 'alta';
  portion: string;
  carbs: number;
  recommendations: string;
}

const foods: Food[] = [
  {
    id: '1',
    name: 'Arroz Branco',
    category: 'Cereais',
    glycemicIndex: 73,
    glycemicLoad: 'alta',
    portion: '150g (1 xícara)',
    carbs: 45,
    recommendations: 'Prefira arroz integral. Consuma com moderação.'
  },
  {
    id: '2',
    name: 'Arroz Integral',
    category: 'Cereais',
    glycemicIndex: 55,
    glycemicLoad: 'media',
    portion: '150g (1 xícara)',
    carbs: 45,
    recommendations: 'Opção mais saudável que o arroz branco.'
  },
  {
    id: '3',
    name: 'Batata Inglesa',
    category: 'Tubérculos',
    glycemicIndex: 85,
    glycemicLoad: 'alta',
    portion: '150g (1 unidade média)',
    carbs: 30,
    recommendations: 'Evite ou consuma em pequenas quantidades.'
  },
  {
    id: '4',
    name: 'Batata Doce',
    category: 'Tubérculos',
    glycemicIndex: 45,
    glycemicLoad: 'baixa',
    portion: '150g (1 unidade média)',
    carbs: 27,
    recommendations: 'Boa opção de carboidrato complexo.'
  },
  {
    id: '5',
    name: 'Pão Branco',
    category: 'Panificados',
    glycemicIndex: 75,
    glycemicLoad: 'alta',
    portion: '30g (1 fatia)',
    carbs: 15,
    recommendations: 'Evite ou substitua por pão integral.'
  },
  {
    id: '6',
    name: 'Pão Integral',
    category: 'Panificados',
    glycemicIndex: 51,
    glycemicLoad: 'media',
    portion: '30g (1 fatia)',
    carbs: 12,
    recommendations: 'Melhor opção que o pão branco.'
  },
  {
    id: '7',
    name: 'Maçã',
    category: 'Frutas',
    glycemicIndex: 36,
    glycemicLoad: 'baixa',
    portion: '120g (1 unidade média)',
    carbs: 15,
    recommendations: 'Excelente opção de lanche. Rica em fibras.'
  },
  {
    id: '8',
    name: 'Banana',
    category: 'Frutas',
    glycemicIndex: 51,
    glycemicLoad: 'media',
    portion: '120g (1 unidade média)',
    carbs: 27,
    recommendations: 'Prefira banana verde ou menos madura.'
  },
  {
    id: '9',
    name: 'Melancia',
    category: 'Frutas',
    glycemicIndex: 72,
    glycemicLoad: 'baixa',
    portion: '150g (1 fatia)',
    carbs: 8,
    recommendations: 'Apesar do IG alto, tem baixo teor de carboidratos.'
  },
  {
    id: '10',
    name: 'Aveia',
    category: 'Cereais',
    glycemicIndex: 55,
    glycemicLoad: 'media',
    portion: '40g (4 colheres de sopa)',
    carbs: 24,
    recommendations: 'Rica em fibras, ajuda no controle glicêmico.'
  },
  {
    id: '11',
    name: 'Feijão',
    category: 'Leguminosas',
    glycemicIndex: 24,
    glycemicLoad: 'baixa',
    portion: '90g (1/2 xícara)',
    carbs: 20,
    recommendations: 'Excelente fonte de proteína e fibras.'
  },
  {
    id: '12',
    name: 'Lentilha',
    category: 'Leguminosas',
    glycemicIndex: 32,
    glycemicLoad: 'baixa',
    portion: '90g (1/2 xícara)',
    carbs: 18,
    recommendations: 'Ótima opção, rica em proteínas vegetais.'
  },
  {
    id: '13',
    name: 'Quinoa',
    category: 'Cereais',
    glycemicIndex: 53,
    glycemicLoad: 'media',
    portion: '150g (1 xícara cozida)',
    carbs: 39,
    recommendations: 'Superalimento, rica em proteínas completas.'
  },
  {
    id: '14',
    name: 'Brócolis',
    category: 'Vegetais',
    glycemicIndex: 10,
    glycemicLoad: 'baixa',
    portion: '100g (1 xícara)',
    carbs: 4,
    recommendations: 'Consuma à vontade, rico em nutrientes.'
  },
  {
    id: '15',
    name: 'Espinafre',
    category: 'Vegetais',
    glycemicIndex: 15,
    glycemicLoad: 'baixa',
    portion: '100g (1 xícara)',
    carbs: 3,
    recommendations: 'Excelente fonte de ferro e vitaminas.'
  }
];

export function NutritionalListSimple() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [...new Set(foods.map(food => food.category))];

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getGlycemicIcon = (glycemicIndex: number) => {
    if (glycemicIndex < 55) return '📉';
    if (glycemicIndex < 70) return '➖';
    return '📈';
  };

  const getGlycemicColor = (glycemicLoad: Food['glycemicLoad']) => {
    switch (glycemicLoad) {
      case 'baixa':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'alta':
        return 'bg-red-100 text-red-800 border border-red-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Cereais': 'bg-blue-100 text-blue-800',
      'Frutas': 'bg-green-100 text-green-800',
      'Vegetais': 'bg-emerald-100 text-emerald-800',
      'Tubérculos': 'bg-orange-100 text-orange-800',
      'Panificados': 'bg-amber-100 text-amber-800',
      'Leguminosas': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Lista Nutricional</h2>
        <p className="text-gray-500">
          Consulte o índice glicêmico dos alimentos e receba recomendações
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔍 Buscar alimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as categorias</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredFoods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <p>Nenhum alimento encontrado</p>
            <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          filteredFoods.map((food) => (
            <div key={food.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold">{food.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(food.category)}`}>
                      {food.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getGlycemicIcon(food.glycemicIndex)}</span>
                      <span className="text-sm">
                        <strong>IG:</strong> {food.glycemicIndex}
                      </span>
                    </div>
                    <div className="text-sm">
                      <strong>Porção:</strong> {food.portion}
                    </div>
                    <div className="text-sm">
                      <strong>Carboidratos:</strong> {food.carbs}g
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {food.recommendations}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 text-xs rounded ${getGlycemicColor(food.glycemicLoad)}`}>
                    Carga glicêmica {food.glycemicLoad}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <span>📉</span>
          Sobre o Índice Glicêmico
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>Baixo (≤ 55):</strong> Alimentos que causam menor elevação da glicemia</p>
          <p><strong>Médio (56-69):</strong> Alimentos com elevação moderada da glicemia</p>
          <p><strong>Alto (≥ 70):</strong> Alimentos que causam maior elevação da glicemia</p>
          <p className="mt-3 text-xs">
            <strong>Importante:</strong> Consulte sempre seu médico ou nutricionista antes de fazer mudanças na sua dieta.
          </p>
        </div>
      </div>
    </div>
  );
}