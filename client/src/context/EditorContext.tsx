import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { ValidationWarning } from '../../../server/src/services/excel-parser';

export interface ExcelData {
  headers: string[];
  rows: Record<string, string>[];       // ALL rows for client-side generation
  previewRows: Record<string, string>[]; // First 5 rows for UI preview
  totalRows: number;
  warnings: ValidationWarning[];
}

export interface TemplateData {
  url: string;
  width: number;
  height: number;
  originalName: string;
}

export interface ActiveObjectProps {
  type?: 'text' | 'qr';
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  textAlign?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  underline?: boolean;
  boundColumn?: string;
  angle?: number;
}

export interface EditorState {
  sessionId: string | null;
  excelData: ExcelData | null;
  templateData: TemplateData | null;
  
  // Selected placeholder on the canvas
  selectedId: string | null;
  
  // Properties of the selected placeholder
  activeObjectProps: ActiveObjectProps | null;
  
  // Signal to canvas to update active object property
  propertyUpdateSignal: { key: string; value: any; timestamp: number } | null;
  
  // Layout placeholders extracted from canvas
  placeholders: Placeholder[];
  setPlaceholders: (placeholders: Placeholder[]) => void;
  
  // The column explicitly bound to the QR code (if any)
  qrBoundColumn: string | null;
}

interface EditorContextType extends EditorState {
  setSessionId: (id: string) => void;
  setExcelData: (data: ExcelData) => void;
  setTemplateData: (data: TemplateData) => void;
  setSelectedId: (id: string | null) => void;
  setQrBoundColumn: (column: string | null) => void;
  setActiveObjectProps: (props: ActiveObjectProps | null) => void;
  setPropertyUpdateSignal: (signal: { key: string; value: any; timestamp: number } | null) => void;
  reset: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qrBoundColumn, setQrBoundColumn] = useState<string | null>(null);
  const [activeObjectProps, setActiveObjectProps] = useState<ActiveObjectProps | null>(null);
  const [propertyUpdateSignal, setPropertyUpdateSignal] = useState<{ key: string; value: any; timestamp: number } | null>(null);

  const [placeholders, setPlaceholders] = useState<any[]>([]);

  const reset = () => {
    setSessionId(null);
    setExcelData(null);
    setTemplateData(null);
    setSelectedId(null);
    setQrBoundColumn(null);
    setActiveObjectProps(null);
    setPropertyUpdateSignal(null);
    setPlaceholders([]);
  };

  return (
    <EditorContext.Provider
      value={{
        sessionId,
        excelData,
        templateData,
        selectedId,
        qrBoundColumn,
        activeObjectProps,
        propertyUpdateSignal,
        placeholders,
        setPlaceholders,
        setSessionId,
        setExcelData,
        setTemplateData,
        setSelectedId,
        setQrBoundColumn,
        setActiveObjectProps,
        setPropertyUpdateSignal,
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
