import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

// Lazy-load heavy pages to keep initial bundle small
const LandingPage = lazy(() => import('./pages/LandingPage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const GeneratePage = lazy(() => import('./pages/GeneratePage'));
const VerifyPage = lazy(() => import('./pages/VerifyPage'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm text-surface-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/verify/:certificateId" element={<VerifyPage />} />
      </Routes>
      <Analytics />
    </Suspense>
  );
}
