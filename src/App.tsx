import React from 'react';
import { Building2, Home } from 'lucide-react';
import { InvestmentForm } from './components/InvestmentForm';
import { AnalysisResults } from './components/AnalysisResults';
import { SaveSimulationDialog } from './components/SaveSimulationDialog';
import { SimulationList } from './components/SimulationList';
import { ComparisonView } from './components/ComparisonView';
import { 
  calculateInitialInvestment,
  calculateTotalCosts,
  calculatePricePayment, 
  calculateROI, 
  calculateRemainingDebt,
  calculateMonthlyROI 
} from './utils/calculations';
import type { AnalysisResult, Model1Params, Model2Params, FinancingParams } from './types/investment';

type ModelData = (Model1Params | Model2Params) & FinancingParams;
type View = 'calculator' | 'comparison';

const STORAGE_KEY = 'investmentData';

function App() {
  const [view, setView] = React.useState<View>('calculator');
  const [activeModel, setActiveModel] = React.useState<1 | 2>(1);
  const [lastModelData, setLastModelData] = React.useState<Record<1 | 2, ModelData>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      1: {
        propertyValue: 120000,
        renovationCost: 30000,
        timeframe: 6,
        profitMargin: 30,
        downPayment: 20,
        renovationDownPayment: 100,
        interestRate: 3,
        renovationInterestRate: 5,
        term: 30,
        renovationTerm: 5,
      },
      2: {
        landValue: 75000,
        constructionCost: 75000,
        timeframe: 24,
        profitMargin: 60,
        downPayment: 100,
        renovationDownPayment: 100,
        interestRate: 3,
        renovationInterestRate: 3,
        term: 30,
        renovationTerm: 30,
      }
    };
  });

  const calculateResultsForModel = React.useCallback((modelType: 1 | 2, modelData: ModelData) => {
    const initialInvestment = calculateInitialInvestment(modelType, modelData);
    const totalCosts = calculateTotalCosts(modelType, modelData, 0, modelData.timeframe);
    const totalRevenue = totalCosts * (1 + modelData.profitMargin / 100);
    const netProfit = totalRevenue - totalCosts;
    const roi = calculateROI(totalRevenue, totalCosts, initialInvestment);

    return {
      id: '',
      name: '',
      modelType,
      date: '',
      totalInvestment: totalCosts,
      totalRevenue,
      netProfit,
      roi,
      monthlyPayment: 0,
      remainingDebt: 0,
      cashFlow: [],
      parameters: modelData,
    };
  }, []);

  const [results, setResults] = React.useState<AnalysisResult>(() => {
    return calculateResultsForModel(1, lastModelData[1]);
  });

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [simulations, setSimulations] = React.useState<AnalysisResult[]>([]);
  const [selectedSimulations, setSelectedSimulations] = React.useState<AnalysisResult[]>([]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lastModelData));
  }, [lastModelData]);

  const handleModelChange = (type: 1 | 2) => {
    setActiveModel(type);
    const modelData = lastModelData[type];
    const newResults = calculateResultsForModel(type, modelData);
    setResults(newResults);
  };

  const handleDataChange = (data: ModelData) => {
    setLastModelData(prev => ({
      ...prev,
      [activeModel]: data
    }));
    const newResults = calculateResultsForModel(activeModel, data);
    setResults(newResults);
  };

  const handleSaveSimulation = (name: string) => {
    const newSimulation: AnalysisResult = {
      ...results,
      id: crypto.randomUUID(),
      name,
      date: new Date().toISOString(),
    };
    setSimulations(prev => [...prev, newSimulation]);
    setIsDialogOpen(false);
  };

  const handleDeleteSimulation = (id: string) => {
    setSimulations(prev => prev.filter(sim => sim.id !== id));
    setSelectedSimulations(prev => prev.filter(sim => sim.id !== id));
  };

  const handleSelectSimulation = (simulation: AnalysisResult) => {
    setSelectedSimulations(prev => {
      const isAlreadySelected = prev.some(sim => sim.id === simulation.id);
      
      if (isAlreadySelected) {
        return prev.filter(sim => sim.id !== simulation.id);
      }
      
      if (prev.length < 2) {
        const newSelected = [...prev, simulation];
        if (newSelected.length === 2) {
          setTimeout(() => setView('comparison'), 0);
        }
        return newSelected;
      }
      
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-center">
            <div className="inline-flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => handleModelChange(1)}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                  activeModel === 1
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Compra e Reforma</span>
              </button>
              
              <button
                onClick={() => handleModelChange(2)}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                  activeModel === 2
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Terreno e Construção</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Análise de Investimentos Imobiliários
          </h1>
          <p className="text-lg text-gray-600">
            Compare modelos de investimento e tome decisões informadas
          </p>
        </header>

        <div className="min-h-[800px]">
          {view === 'calculator' ? (
            <div className="space-y-8">
              <InvestmentForm
                modelType={activeModel}
                initialData={lastModelData[activeModel]}
                onModelChange={handleDataChange}
              />

              <AnalysisResults result={results} modelType={activeModel} />

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Salvar Simulação
                </button>
                {simulations.length > 0 && selectedSimulations.length === 2 && (
                  <button
                    onClick={() => setView('comparison')}
                    className="px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Ver Comparativo
                  </button>
                )}
              </div>

              {simulations.length > 0 && (
                <SimulationList
                  simulations={simulations}
                  onDelete={handleDeleteSimulation}
                  onSelect={handleSelectSimulation}
                  selectedSimulations={selectedSimulations}
                />
              )}
            </div>
          ) : (
            <ComparisonView
              simulations={selectedSimulations}
              onBack={() => {
                setView('calculator');
                setSelectedSimulations([]);
              }}
            />
          )}
        </div>

        <SaveSimulationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveSimulation}
        />
      </div>
    </div>
  );
}

export default App;