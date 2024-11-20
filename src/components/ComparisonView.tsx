import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { AnalysisResult } from '../types/investment';
import { Card } from './ui/Card';
import { formatCurrency } from '../utils/format';
import { 
  calculateInitialInvestment,
  calculateFinancedAmount,
  calculatePricePayment,
  calculateInterestInPeriod
} from '../utils/calculations';

interface Props {
  simulations: AnalysisResult[];
  onBack: () => void;
}

interface ROIAnalysis {
  name: string;
  timeframe: number;
  transactions: number;
  roiPerTransaction: number;
  totalROI: number;
  totalProfit: number;
}

export const ComparisonView: React.FC<Props> = ({ simulations, onBack }) => {
  const maxTimeframe = Math.max(...simulations.map(sim => sim.parameters.timeframe));

  const roiAnalysis = React.useMemo(() => {
    return simulations.map(sim => {
      // Número de transações possíveis no período máximo
      const transactions = Math.floor(maxTimeframe / sim.parameters.timeframe);
      
      // ROI por transação
      const roiPerTransaction = sim.roi;
      
      // ROI total considerando todas as transações possíveis
      const totalROI = roiPerTransaction * transactions;
      
      // Lucro total considerando todas as transações
      const totalProfit = sim.netProfit * transactions;

      return {
        name: sim.name,
        timeframe: sim.parameters.timeframe,
        transactions,
        roiPerTransaction,
        totalROI,
        totalProfit
      };
    });
  }, [simulations, maxTimeframe]);

  // Análise anual do ROI acumulado
  const yearlyROIAnalysis = React.useMemo(() => {
    const years = Math.ceil(maxTimeframe / 12);
    return Array.from({ length: years }, (_, yearIndex) => {
      const monthsElapsed = (yearIndex + 1) * 12;
      
      return roiAnalysis.map(analysis => {
        // Número de transações completas até este momento
        const completedTransactions = Math.floor(monthsElapsed / analysis.timeframe);
        // ROI acumulado até este momento
        const accumulatedROI = analysis.roiPerTransaction * completedTransactions;
        
        return {
          name: analysis.name,
          transactions: completedTransactions,
          roi: accumulatedROI,
          profit: analysis.totalProfit * (completedTransactions / analysis.transactions)
        };
      });
    });
  }, [roiAnalysis, maxTimeframe]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">Comparativo de Simulações</h2>
      </div>

      {/* ROI Analysis Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Análise Comparativa de ROI</h3>
        <div className="space-y-6">
          {roiAnalysis.map((analysis, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{analysis.name}</h4>
                  <p className="text-sm text-gray-600">
                    {analysis.timeframe} meses por transação
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg text-blue-600">
                    {analysis.totalROI.toFixed(2)}% total
                  </p>
                  <p className="text-sm text-gray-600">
                    {analysis.transactions} transações em {maxTimeframe} meses
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">ROI por Transação</span>
                  <span className="font-medium">{analysis.roiPerTransaction.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">ROI Mensal Médio</span>
                  <span className="font-medium">
                    {(analysis.totalROI / maxTimeframe).toFixed(2)}% ao mês
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Lucro Total Projetado</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(analysis.totalProfit)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Yearly ROI Progression */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Progressão Anual do ROI</h3>
        <div className="space-y-4">
          {yearlyROIAnalysis.map((yearData, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Ano {index + 1}</h4>
              <div className="space-y-4">
                {yearData.map((data, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-600">{data.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({data.transactions} transações)
                        </span>
                      </div>
                      <span className="font-medium text-blue-600">
                        {data.roi.toFixed(2)}% acumulado
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Lucro Acumulado</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(data.profit)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Original simulation details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {simulations.map((simulation) => {
          const modelType = simulation.modelType;
          const initialInvestment = calculateInitialInvestment(modelType, simulation.parameters);
          
          let propertyPayment = 0;
          let renovationPayment = 0;
          let propertyInterest = 0;
          let renovationInterest = 0;
          let totalValue = 0;
          let totalDownPayment = 0;
          let totalFinanced = 0;
          let totalMonthlyPayment = 0;
          let totalInterest = 0;

          if (modelType === 1) {
            propertyPayment = calculatePricePayment(
              simulation.parameters.propertyValue * (1 - simulation.parameters.downPayment / 100),
              simulation.parameters.interestRate,
              simulation.parameters.term
            );

            renovationPayment = calculatePricePayment(
              simulation.parameters.renovationCost * (1 - simulation.parameters.renovationDownPayment / 100),
              simulation.parameters.renovationInterestRate,
              simulation.parameters.renovationTerm
            );

            propertyInterest = calculateInterestInPeriod(
              simulation.parameters.propertyValue * (1 - simulation.parameters.downPayment / 100),
              propertyPayment,
              simulation.parameters.interestRate,
              simulation.parameters.timeframe
            );

            renovationInterest = calculateInterestInPeriod(
              simulation.parameters.renovationCost * (1 - simulation.parameters.renovationDownPayment / 100),
              renovationPayment,
              simulation.parameters.renovationInterestRate,
              simulation.parameters.timeframe
            );

            totalValue = simulation.parameters.propertyValue + simulation.parameters.renovationCost;
            totalDownPayment = (simulation.parameters.propertyValue * (simulation.parameters.downPayment / 100)) + 
                             (simulation.parameters.renovationCost * (simulation.parameters.renovationDownPayment / 100));
            totalFinanced = (simulation.parameters.propertyValue * (1 - simulation.parameters.downPayment / 100)) +
                          (simulation.parameters.renovationCost * (1 - simulation.parameters.renovationDownPayment / 100));
          } else {
            propertyPayment = calculatePricePayment(
              simulation.parameters.landValue * (1 - simulation.parameters.downPayment / 100),
              simulation.parameters.interestRate,
              simulation.parameters.term
            );

            renovationPayment = calculatePricePayment(
              simulation.parameters.constructionCost * (1 - simulation.parameters.downPayment / 100),
              simulation.parameters.interestRate,
              simulation.parameters.term
            );

            propertyInterest = calculateInterestInPeriod(
              simulation.parameters.landValue * (1 - simulation.parameters.downPayment / 100),
              propertyPayment,
              simulation.parameters.interestRate,
              simulation.parameters.timeframe
            );

            renovationInterest = calculateInterestInPeriod(
              simulation.parameters.constructionCost * (1 - simulation.parameters.downPayment / 100),
              renovationPayment,
              simulation.parameters.interestRate,
              simulation.parameters.timeframe
            );

            totalValue = simulation.parameters.landValue + simulation.parameters.constructionCost;
            totalDownPayment = totalValue * (simulation.parameters.downPayment / 100);
            totalFinanced = totalValue * (1 - simulation.parameters.downPayment / 100);
          }

          totalMonthlyPayment = propertyPayment + renovationPayment;
          totalInterest = propertyInterest + renovationInterest;

          return (
            <Card key={simulation.id} className="p-6">
              <h3 className="text-xl font-bold mb-6">{simulation.name}</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">Informações Gerais</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Tipo</span>
                      <span className="font-medium">
                        {modelType === 1 ? 'Compra e Reforma' : 'Terreno e Construção'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Prazo</span>
                      <span className="font-medium">
                        {simulation.parameters.timeframe} meses
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Margem de Lucro</span>
                      <span className="font-medium">
                        {simulation.parameters.profitMargin}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Valores</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Valor Total</span>
                      <span className="font-medium">
                        {formatCurrency(totalValue)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Total de Entradas</span>
                      <span className="font-medium">
                        {formatCurrency(totalDownPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Total Financiado</span>
                      <span className="font-medium">
                        {formatCurrency(totalFinanced)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Parcela Mensal</span>
                      <span className="font-medium">
                        {formatCurrency(totalMonthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Total de Juros</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(totalInterest)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Resultados por Transação</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Investimento Total</span>
                      <span className="font-medium">
                        {formatCurrency(simulation.totalInvestment)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Receita Total</span>
                      <span className="font-medium">
                        {formatCurrency(simulation.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Lucro Líquido</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(simulation.netProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">ROI por Transação</span>
                      <span className="font-medium">
                        {simulation.roi.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">ROI Mensal</span>
                      <span className="font-medium">
                        {(simulation.roi / simulation.parameters.timeframe).toFixed(2)}% ao mês
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};