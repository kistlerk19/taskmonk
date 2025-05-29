import React from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = '' }) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-400',
          icon: <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />,
          text: 'text-green-700',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-400',
          icon: <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />,
          text: 'text-red-700',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-400',
          icon: <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />,
          text: 'text-yellow-700',
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-400',
          icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />,
          text: 'text-blue-700',
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className={`border-l-4 p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">{styles.icon}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${styles.text}`}>{message}</p>
        </div>
        {onClose && (
          <div className="pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 ${styles.text} hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50`}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;