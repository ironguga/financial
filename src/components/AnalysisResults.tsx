import React from 'react';
import { BarChart, TrendingUp, DollarSign, Calculator } from 'lucide-react';
import { Card } from './ui/Card';
import type { AnalysisResult } from '../types/investment';
import { formatCurrency } from '../utils/format';
import { 
  calculateInitialInvestment,
  calculateFinancedAmount,
  calculatePricePayment,
  calculateInterestInPeriod,
  calculateRemainingDebt,
  calculateTotalCosts,
  calculateSalePrice,
  calculateROI,
  calculatePaybackPeriod
} from '../utils/calculations';

interface Props {
  result: AnalysisResult;
  modelType: 1 | 2;
}

export const AnalysisResults: React.FC<Props> = ({ result, modelType }) => {
  // Calcula custos totais incluindo financiamento
  const totalCosts = calculateTotalCosts(modelType, result.parameters);
  
  // Calcula preço de venda baseado nos custos e margem
  const salePrice = calculateSalePrice(totalCosts, result.parameters.profitMargin);
  
  // Calcula investimento inicial (apenas entradas)
  const initialInvestment = calculateInitialInvestment(modelType, result.parameters);
  
  // Calcula ROI sobre o investimento inicial
  const roi = calculateROI(salePrice, totalCosts, initialInvestment);
  
  // Calcula lucro líquido
  const netProfit = salePrice - totalCosts;

  // Cálculos específicos por modelo
  let propertyPayment = 0;
  let renovationPayment = 0;
  let propertyInterest = 0;
  let renovationInterest = 0;
  let propertyDebt = 0;
  let renovationDebt = 0;

  if (modelType === 1) {
    const propertyFinanced = result.parameters.propertyValue * (1 - result.parameters.downPayment / 100);
    const renovationFinanced = result.parameters.renovationCost * (1 - result.parameters.renovationDownPayment / 100);

    propertyPayment = calculatePricePayment(
      propertyFinanced,
      result.parameters.interestRate,
      result.parameters.term
    );

    renovationPayment = calculatePricePayment(
      renovationFinanced,
      result.parameters.renovationInterestRate,
      result.parameters.renovationTerm
    );

    propertyInterest = calculateInterestInPeriod(
      propertyFinanced,
      propertyPayment,
      result.parameters.interestRate,
      result.parameters.timeframe
    );

    renovationInterest = calculateInterestInPeriod(
      renovationFinanced,
      renovationPayment,
      result.parameters.renovationInterestRate,
      result.parameters.timeframe
    );

    propertyDebt = calculateRemainingDebt(
      propertyFinanced,
      propertyPayment,
      result.parameters.interestRate,
      result.parameters.timeframe
    );

    renovationDebt = calculateRemainingDebt(
      renovationFinanced,
      renovationPayment,
      result.parameters.renovationInterestRate,
      result.parameters.timeframe
    );
  } else {
    const totalValue = result.parameters.landValue + result.parameters.constructionCost;
    const financed = totalValue * (1 - result.parameters.downPayment / 100);
    
    propertyPayment = calculatePricePayment(
      financed,
      result.parameters.interestRate,
      result.parameters.term
    );

    propertyInterest = calculateInterestInPeriod(
      financed,
      propertyPayment,
      result.parameters.interestRate,
      result.parameters.timeframe
    );

    propertyDebt = calculateRemainingDebt(
      financed,
      propertyPayment,
      result.parameters.interestRate,
      result.parameters.timeframe
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-600">Investimento Total</h3>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalCosts)}</p>
          <p className="text-sm text-gray-600 mt-1">
            Inclui entradas, parcelas e juros
          </p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-600">Lucro Líquido</h3>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(netProfit)}</p>
          <p className="text-sm text-gray-600 mt-1">
            Margem: {result.parameters.profitMargin}%
          </p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-600">ROI</h3>
          </div>
          <p className="text-2xl font-bold">{roi.toFixed(2)}%</p>
          <p className="text-sm text-gray-600 mt-1">
            {(roi / result.parameters.timeframe).toFixed(2)}% ao mês
          </p>
        </div>
        
        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-600">Prazo Total</h3>
          </div>
          <p className="text-2xl font-bold">{result.parameters.timeframe} meses</p>
          <p className="text-sm text-gray-600 mt-1">
            Retorno em {calculatePaybackPeriod(roi, result.parameters.timeframe)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {modelType === 1 ? 'Financiamento do Imóvel' : 'Financiamento do Terreno'}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">
                {modelType === 1 ? 'Valor do Imóvel' : 'Valor do Terreno'}
              </span>
              <span className="font-medium">
                {formatCurrency(modelType === 1 ? result.parameters.propertyValue : result.parameters.landValue)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Entrada</span>
              <span className="font-medium">
                {formatCurrency(
                  modelType === 1 
                    ? result.parameters.propertyValue * (result.parameters.downPayment / 100)
                    : result.parameters.landValue * (result.parameters.downPayment / 100)
                )}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Valor Financiado</span>
              <span className="font-medium">
                {formatCurrency(
                  modelType === 1
                    ? result.parameters.propertyValue * (1 - result.parameters.downPayment / 100)
                    : result.parameters.landValue * (1 - result.parameters.downPayment / 100)
                )}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Parcela Mensal</span>
              <span className="font-medium">
                {formatCurrency(propertyPayment)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total de Juros</span>
              <span className="font-medium text-red-600">
                {formatCurrency(propertyInterest)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Saldo Devedor</span>
              <span className="font-medium">
                {formatCurrency(propertyDebt)}
              </span>
            </div>
          </div>
        </Card>

        {modelType === 1 ? (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Financiamento da Reforma</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Valor da Reforma</span>
                <span className="font-medium">
                  {formatCurrency(result.parameters.renovationCost)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Entrada</span>
                <span className="font-medium">
                  {formatCurrency(result.parameters.renovationCost * (result.parameters.renovationDownPayment / 100))}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Valor Financiado</span>
                <span className="font-medium">
                  {formatCurrency(result.parameters.renovationCost * (1 - result.parameters.renovationDownPayment / 100))}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Parcela Mensal</span>
                <span className="font-medium">
                  {formatCurrency(renovationPayment)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total de Juros</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(renovationInterest)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Saldo Devedor</span>
                <span className="font-medium">
                  {formatCurrency(renovationDebt)}
                </span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Financiamento da Construção</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Valor da Construção</span>
                <span className="font-medium">
                  {formatCurrency(result.parameters.constructionCost)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Entrada</span>
                <span className="font-medium">
                  {formatCurrency(result.parameters.constructionCost * (result.parameters.downPayment / 100))}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Valor Financiado</span>
                <span className="font-medium">
                  {formatCurrency(result.parameters.constructionCost * (1 - result.parameters.downPayment / 100))}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resumo Total dos Financiamentos</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Valor Total</span>
            <span className="font-medium">
              {formatCurrency(
                modelType === 1
                  ? result.parameters.propertyValue + result.parameters.renovationCost
                  : result.parameters.landValue + result.parameters.constructionCost
              )}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Total de Entradas</span>
            <span className="font-medium">
              {formatCurrency(initialInvestment)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Total Financiado</span>
            <span className="font-medium">
              {formatCurrency(calculateFinancedAmount(modelType, result.parameters))}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Parcela Mensal Total</span>
            <span className="font-medium">
              {formatCurrency(propertyPayment + renovationPayment)}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Total de Juros</span>
            <span className="font-medium text-red-600">
              {formatCurrency(propertyInterest + renovationInterest)}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resumo Financeiro</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-500" />
              <span className="text-gray-600">Investimento Total</span>
            </div>
            <span className="font-medium text-red-500">
              {formatCurrency(totalCosts)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-gray-600">Preço de Venda</span>
            </div>
            <span className="font-medium text-green-500">
              {formatCurrency(salePrice)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span className="text-gray-600">Lucro Líquido</span>
            </div>
            <span className="font-medium text-blue-600">
              {formatCurrency(netProfit)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};