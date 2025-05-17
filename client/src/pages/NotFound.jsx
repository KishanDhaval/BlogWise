import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <BookOpen className="mx-auto h-16 w-16 text-emerald-600" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
          404 - Page Not Found
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to home page
          </Link>
          <p className="text-sm text-slate-500">
            If you think this is an error, please{' '}
            <a href="#" className="text-emerald-600 hover:text-emerald-500">
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;