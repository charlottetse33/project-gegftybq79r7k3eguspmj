import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlowchartPreview } from './FlowchartPreview';
import { DiagramDebugger } from './DiagramDebugger';
import { useFlowchartGenerator } from '@/hooks/useFlowchartGenerator';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Download, Copy, Bug } from 'lucide-react';

export const FlowchartBuilder: React.FC = () => {
  const [description, setDescription] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [isDebuggerVisible, setIsDebuggerVisible] = useState(false);
  const { generateFlowchart, isGenerating, error, detectedDiagramType, clearError } = useFlowchartGenerator();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a description for your diagram",
        variant: "destructive",
      });
      return;
    }

    clearError();
    
    try {
      const result = await generateFlowchart(description);
      setMermaidCode(result);
      toast({
        title: "Diagram generated successfully",
        description: `Created a ${detectedDiagramType}`,
      });
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Failed to generate diagram",
        variant: "destructive",
      });
    }
  };

  const handleCopy = () => {
    if (mermaidCode) {
      navigator.clipboard.writeText(mermaidCode);
      toast({
        title: "Copied to clipboard",
        description: "Mermaid code has been copied to your clipboard",
      });
    }
  };

  const handleDownload = () => {
    if (mermaidCode) {
      const blob = new Blob([mermaidCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.mmd';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Mermaid file has been downloaded",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Data Pipeline Diagram Generator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Describe your data pipeline, workflow, or system architecture and get a professional diagram instantly.
            Supports ER diagrams, flowcharts, sequence diagrams, and more.
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-600" />
              Describe Your Diagram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe your data pipeline, workflow, or system architecture. For example:
- 'A user registration system with database validation'
- 'Data flow from API to data warehouse through ETL process'
- 'Customer order processing workflow with payment gateway'
- 'Database schema for e-commerce platform with users, products, and orders'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-32 resize-none"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {detectedDiagramType && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {detectedDiagramType}
                  </Badge>
                )}
                {error && (
                  <Badge variant="destructive">
                    Error
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsDebuggerVisible(!isDebuggerVisible)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Bug className="w-4 h-4" />
                  Debug
                </Button>
                
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !description.trim()}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Diagram
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Diagram Preview</CardTitle>
                  {mermaidCode && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </Button>
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <FlowchartPreview 
                  mermaidCode={mermaidCode} 
                  isLoading={isGenerating}
                />
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Supported Diagrams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <Badge variant="outline">ER Diagrams</Badge>
                  <Badge variant="outline">Flowcharts</Badge>
                  <Badge variant="outline">Sequence Diagrams</Badge>
                  <Badge variant="outline">Class Diagrams</Badge>
                  <Badge variant="outline">State Diagrams</Badge>
                  <Badge variant="outline">User Journeys</Badge>
                  <Badge variant="outline">Gantt Charts</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• Be specific about relationships and data flow</p>
                <p>• Mention entity names and attributes for ER diagrams</p>
                <p>• Include decision points for flowcharts</p>
                <p>• Describe interactions for sequence diagrams</p>
                <p>• Use the debug tool to troubleshoot syntax issues</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Debugger */}
      <DiagramDebugger
        mermaidCode={mermaidCode}
        originalPrompt={description}
        detectedDiagramType={detectedDiagramType}
        isVisible={isDebuggerVisible}
        onToggle={() => setIsDebuggerVisible(!isDebuggerVisible)}
      />
    </div>
  );
};