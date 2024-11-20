import React from 'react';
import { Trash2, ArrowRight, Check } from 'lucide-react';
import type { AnalysisResult } from '../types/investment';
import { Card } from './ui/Card';

interface Props {
  simulations: AnalysisResult[];
  selectedSimulations: AnalysisResult[];
  onDelete: (id: string) => void;
  onSelect: (simulation: AnalysisResult) => void;
}

export const SimulationList: React.FC<Props> = ({ 
  simulations, 
  selectedSimulations,
  onDelete, 
  onSelect 
}) => {
  const isSelected = (id: string) => selectedSimulations.some(sim => sim.id === id);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Simulações Salvas</h2>
      <div className="space-y-4">
        {simulations.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhuma simulação salva ainda.
          </p>
        ) : (
          simulations.map((simulation) => (
            <div
              key={simulation.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div>
                <h3 className="font-semibold">{simulation.name}</h3>
                <p className="text-sm text-gray-600">
                  {simulation.modelType === 1 ? 'Compra e Reforma' : 'Terreno e Construção'} |{' '}
                  {new Date(simulation.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(simulation.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Excluir simulação"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onSelect(simulation)}
                  className={`p-2 rounded-md ${
                    isSelected(simulation.id)
                      ? 'text-green-600 bg-green-50'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                  title={isSelected(simulation.id) ? 'Selecionado' : 'Selecionar para comparação'}
                >
                  {isSelected(simulation.id) ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};