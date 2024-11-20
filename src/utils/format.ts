export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  // Remove todos os caracteres não numéricos exceto o último ponto ou vírgula
  const cleanValue = value
    .replace(/[^0-9.,]/g, '')
    .replace(/[.,](?=.*[.,])/g, '');
    
  // Substitui a vírgula por ponto para conversão
  const numberStr = cleanValue.replace(',', '.');
  const number = Number(numberStr);
  
  return isNaN(number) ? 0 : number;
};