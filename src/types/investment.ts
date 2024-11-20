export interface FinancingParams {
  downPayment: number;
  renovationDownPayment: number;
  interestRate: number;
  renovationInterestRate: number;
  term: number;
  renovationTerm: number;
}

export interface Model1Params {
  propertyValue: number;
  renovationCost: number;
  timeframe: number;      // Prazo de venda
  profitMargin: number;
}

export interface Model2Params {
  landValue: number;
  constructionCost: number;
  timeframe: number;
  profitMargin: number;
}

export interface AnalysisResult {
  id: string;
  name: string;
  modelType: 1 | 2;
  date: string;
  totalInvestment: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
  monthlyPayment: number;
  remainingDebt: number;
  cashFlow: number[];
  parameters: (Model1Params | Model2Params) & FinancingParams;
}