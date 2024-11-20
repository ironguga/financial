// Calcula o valor total das entradas (investimento inicial em dinheiro)
export const calculateInitialInvestment = (
  modelType: 1 | 2,
  params: any
): number => {
  if (modelType === 1) {
    const propertyDownPayment = params.propertyValue * (params.downPayment / 100);
    const renovationDownPayment = params.renovationCost * (params.renovationDownPayment / 100);
    return propertyDownPayment + renovationDownPayment;
  } else {
    const totalValue = params.landValue + params.constructionCost;
    return totalValue * (params.downPayment / 100);
  }
};

// Calcula o valor total financiado
export const calculateFinancedAmount = (
  modelType: 1 | 2,
  params: any
): number => {
  if (modelType === 1) {
    const financedProperty = params.propertyValue * (1 - params.downPayment / 100);
    const financedRenovation = params.renovationCost * (1 - params.renovationDownPayment / 100);
    return financedProperty + financedRenovation;
  } else {
    const totalValue = params.landValue + params.constructionCost;
    return totalValue * (1 - params.downPayment / 100);
  }
};

// Calcula a parcela mensal do financiamento
export const calculatePricePayment = (
  principal: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12 / 100;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
};

// Calcula o total de juros pagos em um período
export const calculateInterestInPeriod = (
  principal: number,
  monthlyPayment: number,
  annualRate: number,
  months: number
): number => {
  if (annualRate === 0) return 0;

  const monthlyRate = annualRate / 12 / 100;
  let balance = principal;
  let totalInterest = 0;
  
  for (let i = 0; i < months; i++) {
    const interestPayment = balance * monthlyRate;
    totalInterest += interestPayment;
    balance = balance * (1 + monthlyRate) - monthlyPayment;
  }
  
  return totalInterest;
};

// Calcula o saldo devedor após um período
export const calculateRemainingDebt = (
  principal: number,
  monthlyPayment: number,
  annualRate: number,
  months: number
): number => {
  if (annualRate === 0) {
    return Math.max(0, principal - (monthlyPayment * months));
  }

  const monthlyRate = annualRate / 12 / 100;
  let balance = principal;
  
  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) - monthlyPayment;
  }
  
  return Math.max(0, balance);
};

// Calcula o custo total do investimento até a venda
export const calculateTotalCosts = (
  modelType: 1 | 2,
  params: any
): number => {
  const timeframe = params.timeframe; // Prazo de venda em meses

  if (modelType === 1) {
    // 1. Custos do Imóvel
    const propertyFinanced = params.propertyValue * (1 - params.downPayment / 100);
    const propertyPayment = calculatePricePayment(
      propertyFinanced,
      params.interestRate,
      params.term
    );
    const propertyInterest = calculateInterestInPeriod(
      propertyFinanced,
      propertyPayment,
      params.interestRate,
      timeframe
    );
    const propertyDebt = calculateRemainingDebt(
      propertyFinanced,
      propertyPayment,
      params.interestRate,
      timeframe
    );
    const propertyDownPayment = params.propertyValue * (params.downPayment / 100);
    const propertyPayments = propertyPayment * timeframe;

    // 2. Custos da Reforma
    const renovationFinanced = params.renovationCost * (1 - params.renovationDownPayment / 100);
    const renovationPayment = calculatePricePayment(
      renovationFinanced,
      params.renovationInterestRate,
      params.renovationTerm
    );
    const renovationInterest = calculateInterestInPeriod(
      renovationFinanced,
      renovationPayment,
      params.renovationInterestRate,
      timeframe
    );
    const renovationDebt = calculateRemainingDebt(
      renovationFinanced,
      renovationPayment,
      params.renovationInterestRate,
      timeframe
    );
    const renovationDownPayment = params.renovationCost * (params.renovationDownPayment / 100);
    const renovationPayments = renovationPayment * timeframe;

    // 3. Custo Total
    return propertyDownPayment + // Entrada do imóvel
           renovationDownPayment + // Entrada da reforma
           propertyPayments + // Parcelas pagas do imóvel
           renovationPayments + // Parcelas pagas da reforma
           propertyInterest + // Juros pagos do imóvel
           renovationInterest + // Juros pagos da reforma
           propertyDebt + // Saldo devedor do imóvel
           renovationDebt; // Saldo devedor da reforma
  } else {
    // Modelo 2: Terreno e Construção
    const totalValue = params.landValue + params.constructionCost;
    const downPayment = totalValue * (params.downPayment / 100);
    const financed = totalValue * (1 - params.downPayment / 100);
    
    const payment = calculatePricePayment(
      financed,
      params.interestRate,
      params.term
    );
    
    const totalInterest = calculateInterestInPeriod(
      financed,
      payment,
      params.interestRate,
      timeframe
    );
    
    const remainingDebt = calculateRemainingDebt(
      financed,
      payment,
      params.interestRate,
      timeframe
    );
    
    const totalPayments = payment * timeframe;

    return downPayment + totalPayments + totalInterest + remainingDebt;
  }
};

// Calcula o preço de venda baseado no custo total e margem de lucro
export const calculateSalePrice = (totalCost: number, profitMargin: number): number => {
  return totalCost * (1 + profitMargin / 100);
};

// Calcula o ROI considerando o investimento inicial real (entradas)
export const calculateROI = (
  salePrice: number,
  totalCosts: number,
  initialInvestment: number
): number => {
  if (initialInvestment === 0) return 0;
  return ((salePrice - totalCosts) / initialInvestment) * 100;
};

// Calcula o ROI mensal
export const calculateMonthlyROI = (roi: number, months: number): number => {
  if (months === 0) return 0;
  return roi / months;
};

// Calcula o período de payback
export const calculatePaybackPeriod = (roi: number, timeframe: number): string => {
  if (roi <= 0) return "N/A";
  const monthlyRoi = roi / timeframe;
  const months = Math.ceil(100 / monthlyRoi);
  
  if (months < 0) return "N/A";
  if (months > 600) return "600+ meses";
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  
  return `${years} ${years === 1 ? 'ano' : 'anos'}${
    remainingMonths > 0 ? ` e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}` : ''
  }`;
};