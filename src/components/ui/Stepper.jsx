import React from 'react';
import { Check } from 'lucide-react';

export function Stepper({ steps = [], currentStep = 1, onStepClick }) {
  const totalSteps = steps.length;
  // Progress percentage for connector line
  const progressPercent = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="stepper" role="navigation" aria-label="Registration Wizard Progress">
      <div className="step-connector">
        <div
          className="step-connector-progress"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isClickable = onStepClick && stepNum < currentStep;

        return (
          <div
            key={step}
            className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${
              isClickable ? 'clickable' : ''
            }`}
            onClick={() => isClickable && onStepClick(stepNum)}
          >
            <div className="step-circle" aria-current={isActive ? 'step' : undefined}>
              {isCompleted ? <Check size={18} strokeWidth={3} /> : stepNum}
            </div>
            <span className="step-label">{step}</span>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
