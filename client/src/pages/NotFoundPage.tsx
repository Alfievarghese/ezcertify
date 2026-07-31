import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-10 text-center space-y-6">
        <h1 className="text-8xl font-black text-primary-500">404</h1>
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Page Not Found</h2>
          <p className="text-surface-500 mt-2">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="pt-4">
          <Button 
            className="w-full"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
