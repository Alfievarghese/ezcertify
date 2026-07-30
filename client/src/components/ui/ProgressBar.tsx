import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  status?: 'active' | 'success' | 'error';
  helperText?: string;
}

export function ProgressBar({ 
  progress, 
  label, 
  showPercent = true,
  status = 'active',
  helperText
}: ProgressBarProps) {
  
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  let barColor = 'bg-primary-500';
  let trackColor = 'bg-surface-200';
  
  if (status === 'success') {
    barColor = 'bg-success-500';
  } else if (status === 'error') {
    barColor = 'bg-danger-500';
    trackColor = 'bg-danger-100';
  }

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="mb-2 flex items-center justify-between text-sm font-medium">
          {label && <span className="text-surface-900">{label}</span>}
          {showPercent && (
            <span className={status === 'error' ? 'text-danger-600' : 'text-surface-600'}>
              {clampedProgress}%
            </span>
          )}
        </div>
      )}
      
      <div className={`h-2.5 w-full overflow-hidden rounded-full ${trackColor}`}>
        <div
          className={`h-full ${barColor} progress-fill`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      
      {helperText && (
        <p className={`mt-2 text-xs ${status === 'error' ? 'text-danger-600' : 'text-surface-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
