import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { useEditorContext } from '../context/EditorContext';
import { Button } from '../components/ui/Button';
import CanvasEditor from '../components/editor/CanvasEditor';
import ColumnSidebar from '../components/editor/ColumnSidebar';
import PropertyPanel from '../components/editor/PropertyPanel';
import ValidationChecklist from '../components/editor/ValidationChecklist';
import MappingPreview from '../components/editor/MappingPreview';

export default function EditorPage() {
  const navigate = useNavigate();
  const { excelData, templateData, qrBoundColumn } = useEditorContext();
  const [showPreview, setShowPreview] = useState(false);
  const [validationPassed, setValidationPassed] = useState(false);

  // Redirect if no data
  useEffect(() => {
    if (!excelData || !templateData) {
      navigate('/');
    }
  }, [excelData, templateData, navigate]);

  if (!excelData || !templateData) return null;

  return (
    <div className="h-screen max-h-screen flex flex-col bg-[#111] overflow-hidden font-sans text-gray-200">
      {/* Header */}
      <header className="h-16 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h1 className="text-sm font-semibold text-white hidden sm:block tracking-wide">Template Editor</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <ValidationChecklist onValidationChange={setValidationPassed} />
          <Button 
            variant="primary"
            disabled={!validationPassed}
            onClick={() => setShowPreview(true)}
            rightIcon={<Play className="w-4 h-4" />}
          >
            Review & Generate
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Data Source */}
        <aside className="w-72 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col shrink-0 overflow-y-auto z-10">
          <ColumnSidebar />
        </aside>

        {/* Center - Canvas Area */}
        <main className="flex-1 flex flex-col relative bg-[#111] overflow-hidden">
          <div className="absolute inset-0">
             <CanvasEditor />
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-80 bg-[#1a1a1a] border-l border-[#2a2a2a] flex flex-col shrink-0 overflow-y-auto z-10">
          <PropertyPanel />
        </aside>
      </div>

      {/* Preview Modal before generation */}
      {showPreview && (
        <MappingPreview 
          onClose={() => setShowPreview(false)} 
          onConfirm={() => navigate('/generate')} 
        />
      )}
    </div>
  );
}
