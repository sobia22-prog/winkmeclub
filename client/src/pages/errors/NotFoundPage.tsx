import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { HelpCircle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 bg-brand-wine/10 border border-brand-wine/30 rounded-3xl flex items-center justify-center text-brand-wine mb-4 animate-bounce">
        <HelpCircle className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-100">404 — Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-sm mt-2 mb-6">
        The page you are trying to access does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
