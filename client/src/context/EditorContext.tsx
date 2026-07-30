import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { ValidationWarning } from '../../../server/src/services/excel-parser';

export interface ExcelData {
  headers: string[];
  previewRows: Record<string, string>[];
  totalRows: number;
  warnings: ValidationWarning[];
}

export interface TemplateData {
  url: string;
  width: number;
  height: number;
  originalName: string;
}

export interface EditorState {
  sessionId: string | null;
  excelData: ExcelData | null;
  templateData: TemplateData | null;
  
  // Selected placeholder on the canvas
  selectedId: string | null;
  
  // The column explicitly bound to the QR code (if any)
  qrBoundColumn: string | null;
}

interface EditorContextType extends EditorState {
  setSessionId: (id: string) => void;
  setExcelData: (data: ExcelData) => void;
  setTemplateData: (data: TemplateData) => void;
  setSelectedId: (id: string | null) => void;
  setQrBoundColumn: (column: string | null) => void;
  reset: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qrBoundColumn, setQrBoundColumn] = useState<string | null>(null);

  const reset = () => {
    setSessionId(null);
    setExcelData(null);
    setTemplateData(null);
    setSelectedId(null);
    setQrBoundColumn(null);
  };

  return (
    <EditorContext.Provider
      value={{
        sessionId,
        excelData,
        templateData,
        selectedId,
        qrBoundColumn,
        setSessionId,
        setExcelData,
        setTemplateData,
        setSelectedId,
        setQrBoundColumn,
        reset,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
}
