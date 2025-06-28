import React from 'react';
import mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

interface FlowchartPreviewProps {
  mermaidCode: string;
  isLoading?: boolean;
}

export const FlowchartPreview: React.FC<FlowchartPreviewProps> = ({ 
  mermaidCode, 
  isLoading = false 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      er: {
        useMaxWidth: true
      },
      sequence: {
        useMaxWidth: true,
        showSequenceNumbers: true
      },
      class: {
        useMaxWidth: true
      },
      state: {
        useMaxWidth: true
      },
      journey: {
        useMaxWidth: true
      },
      gantt: {
        useMaxWidth: true
      }
    });
  }, []);

  useEffect(() => {
    if (chartRef.current && mermaidCode.trim()) {
      try {
        chartRef.current.innerHTML = '';
        const chartId = `chart-${Date.now()}`;
        chartRef.current.innerHTML = `<div class="mermaid" id="${chartId}">${mermaidCode}</div>`;
        mermaid.init(undefined, chartRef.current.querySelector('.mermaid'));
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        chartRef.current.innerHTML = `
          <div class="flex items-center justify-center h-64 text-red-500 bg-red-50 rounded-lg border border-red-200">
            <div class="text-center">
              <p class="font-medium">Invalid Mermaid Syntax</p>
              <p class="text-sm mt-1">Please check your diagram code</p>
            </div>
          </div>
        `;
      }
    }
  }, [mermaidCode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Analyzing and generating diagram...</p>
        </div>
      </div>
    );
  }

  if (!mermaidCode.trim()) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Your diagram will appear here</p>
          <p className="text-xs mt-1">Supports ER diagrams, flowcharts, sequence diagrams, and more</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-auto">
      <div ref={chartRef} className="w-full min-h-64" />
    </div>
  );
};