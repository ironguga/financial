import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface Props {
  currentStep: number;
}

export const Steps: React.FC<Props> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Selecione o Modelo', description: 'Escolha entre Compra e Reforma ou Terreno e Construção' },
    { number: 2, label: 'Configure os Parâmetros', description: 'Defina valores, prazos e condições financeiras' },
    { number: 3, label: 'Analise e Compare', description: 'Visualize resultados e compare diferentes simulações' },
  ];

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center justify-center mb-4">
                {currentStep > step.number ? (
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                ) : currentStep === step.number ? (
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold">
                    {step.number}
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center">
                    <Circle className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className={`font-semibold ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </h3>
                <p className="text-sm text-gray-500 mt-1 hidden md:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-grow flex items-center justify-center">
                <div className={`h-1 w-full ${
                  currentStep > step.number + 1 
                    ? 'bg-green-500' 
                    : currentStep > step.number 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200'
                }`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};