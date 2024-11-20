import React from 'react';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import type { Model1Params, Model2Params, FinancingParams } from '../types/investment';
import { formatNumber, parseCurrency } from '../utils/format';

type FormData = (Model1Params | Model2Params) & FinancingParams;

interface Props {
  onModelChange: (modelData: FormData) => void;
  modelType: 1 | 2;
  initialData: FormData;
}

export const InvestmentForm: React.FC<Props> = ({ onModelChange, modelType, initialData }) => {
  const [formData, setFormData] = React.useState<FormData>(initialData);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let numericValue: number;

    if (['propertyValue', 'renovationCost', 'landValue', 'constructionCost'].includes(name)) {
      numericValue = parseCurrency(value);
    } else if (['downPayment', 'renovationDownPayment'].includes(name)) {
      numericValue = Math.min(100, Math.max(0, parseFloat(value.replace(',', '.')) || 0));
    } else if (['interestRate', 'renovationInterestRate'].includes(name)) {
      numericValue = Math.max(0, parseFloat(value.replace(',', '.')) || 0);
    } else if (['timeframe'].includes(name)) {
      numericValue = Math.max(1, parseInt(value) || 1);
    } else if (['term', 'renovationTerm'].includes(name)) {
      numericValue = Math.max(1, parseInt(value) || 1);
    } else if (name === 'profitMargin') {
      numericValue = Math.max(0, parseFloat(value.replace(',', '.')) || 0);
    } else {
      numericValue = value === '' ? 0 : Number(value.replace(',', '.'));
    }
    
    if (!isNaN(numericValue)) {
      const newData = { ...formData, [name]: numericValue };
      setFormData(newData);
      onModelChange(newData);
    }
  };

  const getValue = (key: keyof FormData): string => {
    if (key in formData) {
      const value = (formData as any)[key] || 0;
      if (['propertyValue', 'renovationCost', 'landValue', 'constructionCost'].includes(key)) {
        return formatNumber(value);
      }
      return value.toString().replace('.', ',');
    }
    return '0';
  };

  if (modelType === 1) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Imóvel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Valor do Imóvel"
              name="propertyValue"
              type="text"
              value={getValue('propertyValue')}
              onChange={handleChange}
              prefix="€"
              tooltip="Valor de compra do imóvel no estado atual"
            />
            <Input
              label="Entrada do Imóvel"
              name="downPayment"
              type="number"
              value={getValue('downPayment')}
              onChange={handleChange}
              suffix="%"
              step="0.01"
              min={0}
              max={100}
              tooltip="Percentual de entrada do financiamento do imóvel"
            />
            <Input
              label="Taxa de Juros do Imóvel"
              name="interestRate"
              type="number"
              value={getValue('interestRate')}
              onChange={handleChange}
              suffix="%"
              step="0.01"
              min={0}
              tooltip="Taxa de juros anual do financiamento do imóvel"
            />
            <Input
              label="Prazo do Financiamento"
              name="term"
              type="number"
              value={getValue('term')}
              onChange={handleChange}
              min={1}
              tooltip="Prazo do financiamento do imóvel em anos"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Reforma</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Custo da Reforma"
              name="renovationCost"
              type="text"
              value={getValue('renovationCost')}
              onChange={handleChange}
              prefix="€"
              tooltip="Custos totais com materiais e mão de obra"
            />
            <Input
              label="Entrada da Reforma"
              name="renovationDownPayment"
              type="number"
              value={getValue('renovationDownPayment')}
              onChange={handleChange}
              suffix="%"
              step="0.01"
              min={0}
              max={100}
              tooltip="Percentual de entrada do financiamento da reforma"
            />
            <Input
              label="Taxa de Juros da Reforma"
              name="renovationInterestRate"
              type="number"
              value={getValue('renovationInterestRate')}
              onChange={handleChange}
              suffix="%"
              step="0.01"
              min={0}
              tooltip="Taxa de juros anual do financiamento da reforma"
            />
            <Input
              label="Prazo do Financiamento"
              name="renovationTerm"
              type="number"
              value={getValue('renovationTerm')}
              onChange={handleChange}
              min={1}
              tooltip="Prazo do financiamento da reforma em anos"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Venda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prazo de Venda"
              name="timeframe"
              type="number"
              value={getValue('timeframe')}
              onChange={handleChange}
              min={1}
              tooltip="Tempo estimado para venda do imóvel após a reforma em meses"
            />
            <Input
              label="Margem de Lucro"
              name="profitMargin"
              type="number"
              value={getValue('profitMargin')}
              onChange={handleChange}
              suffix="%"
              step="0.01"
              min={0}
              tooltip="Percentual de lucro desejado sobre o investimento total"
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Terreno e Construção</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Valor do Terreno"
            name="landValue"
            type="text"
            value={getValue('landValue')}
            onChange={handleChange}
            prefix="€"
            tooltip="Valor de compra do terreno"
          />
          <Input
            label="Custo da Construção"
            name="constructionCost"
            type="text"
            value={getValue('constructionCost')}
            onChange={handleChange}
            prefix="€"
            tooltip="Custos totais com a construção"
          />
          <Input
            label="Prazo de Venda"
            name="timeframe"
            type="number"
            value={getValue('timeframe')}
            onChange={handleChange}
            min={1}
            tooltip="Tempo estimado para venda do imóvel"
          />
          <Input
            label="Margem de Lucro"
            name="profitMargin"
            type="number"
            value={getValue('profitMargin')}
            onChange={handleChange}
            suffix="%"
            step="0.01"
            min={0}
            tooltip="Percentual de lucro desejado sobre o investimento total"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Financiamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Entrada"
            name="downPayment"
            type="number"
            value={getValue('downPayment')}
            onChange={handleChange}
            suffix="%"
            step="0.01"
            min={0}
            max={100}
            tooltip="Percentual de entrada do financiamento"
          />
          <Input
            label="Taxa de Juros"
            name="interestRate"
            type="number"
            value={getValue('interestRate')}
            onChange={handleChange}
            suffix="%"
            step="0.01"
            min={0}
            tooltip="Taxa de juros anual do financiamento"
          />
          <Input
            label="Prazo"
            name="term"
            type="number"
            value={getValue('term')}
            onChange={handleChange}
            min={1}
            tooltip="Prazo do financiamento em anos"
          />
        </div>
      </Card>
    </div>
  );
};