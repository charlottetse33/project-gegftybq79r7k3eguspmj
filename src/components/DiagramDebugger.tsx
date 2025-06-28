import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import mermaid from 'mermaid';

interface DiagramDebuggerProps {
  mermaidCode: string;
  originalPrompt: string;
  detectedDiagramType: string;
  isVisible: boolean;
  onToggle: () => void;
}

export const DiagramDebugger: React.FC<DiagramDebuggerProps> = ({
  mermaidCode,
  originalPrompt,
  detectedDiagramType,
  isVisible,
  onToggle
}) => {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: true, errors: [], warnings: [] });
  const { toast } = useToast();

  useEffect(() => {
    validateMermaidSyntax();
  }, [mermaidCode]);

  const validateMermaidSyntax = async () => {
    if (!mermaidCode.trim()) {
      setValidationResult({ isValid: true, errors: [], warnings: [] });
      return;
    }

    try {
      // Create a temporary element to test parsing
      const tempDiv = document.createElement('div');
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.position = 'absolute';
      tempDiv.innerHTML = `<div class="mermaid">${mermaidCode}</div>`;
      document.body.appendChild(tempDiv);

      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic syntax checks
      const lines = mermaidCode.split('\n');
      const firstLine = lines[0]?.trim().toLowerCase();
      
      // Check if diagram type is declared
      const validDiagramTypes = [
        'flowchart', 'graph', 'sequencediagram', 'classdiagram', 
        'erdiagram', 'statediagram', 'journey', 'gantt', 'pie'
      ];
      
      const hasDiagramType = validDiagramTypes.some(type => 
        firstLine.includes(type.toLowerCase())
      );
      
      if (!hasDiagramType) {
        warnings.push('No diagram type declaration found in first line');
      }

      // Check for common syntax issues
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Check for unmatched brackets
        const openBrackets = (trimmedLine.match(/[\[\{]/g) || []).length;
        const closeBrackets = (trimmedLine.match(/[\]\}]/g) || []).length;
        if (openBrackets !== closeBrackets) {
          warnings.push(`Line ${index + 1}: Unmatched brackets - ${trimmedLine}`);
        }

        // Check for invalid characters in node IDs
        if (trimmedLine.includes('-->') || trimmedLine.includes('---')) {
          const parts = trimmedLine.split(/-->|---/);
          parts.forEach(part => {
            const nodeId = part.trim().split(/[\[\(\{]/)[0];
            if (nodeId && /[^a-zA-Z0-9_-]/.test(nodeId)) {
              warnings.push(`Line ${index + 1}: Node ID contains invalid characters - ${nodeId}`);
            }
          });
        }
      });

      // Try to parse with Mermaid
      try {
        await mermaid.parse(mermaidCode);
        setValidationResult({ 
          isValid: true, 
          errors, 
          warnings 
        });
      } catch (parseError) {
        errors.push(`Mermaid parse error: ${parseError}`);
        setValidationResult({ 
          isValid: false, 
          errors, 
          warnings 
        });
      }

      document.body.removeChild(tempDiv);
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [`Validation error: ${error}`],
        warnings: []
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  const getCodeStats = () => {
    const lines = mermaidCode.split('\n').filter(line => line.trim());
    const nodes = (mermaidCode.match(/\w+\[/g) || []).length;
    const connections = (mermaidCode.match(/-->|---/g) || []).length;
    
    return { lines: lines.length, nodes, connections };
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="w-4 h-4 mr-2" />
        Debug
      </Button>
    );
  }

  const stats = getCodeStats();

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 z-50">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Diagram Debugger</CardTitle>
            <Button onClick={onToggle} variant="ghost" size="sm">
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {validationResult.isValid ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Valid
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Invalid
              </Badge>
            )}
            <Badge variant="outline">{detectedDiagramType}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <Tabs defaultValue="validation" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs">
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="validation" className="mt-2 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {validationResult.errors.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-red-600 mb-1">Errors:</h4>
                    {validationResult.errors.map((error, index) => (
                      <div key={index} className="text-xs bg-red-50 p-2 rounded border-l-2 border-red-200">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
                
                {validationResult.warnings.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-yellow-600 mb-1">Warnings:</h4>
                    {validationResult.warnings.map((warning, index) => (
                      <div key={index} className="text-xs bg-yellow-50 p-2 rounded border-l-2 border-yellow-200">
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
                
                {validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    No issues detected
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="code" className="mt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Raw Mermaid Code:</span>
                  <Button
                    onClick={() => copyToClipboard(mermaidCode)}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <pre className="text-xs bg-gray-50 p-2 rounded max-h-32 overflow-auto border">
                  {mermaidCode || 'No code generated yet'}
                </pre>
                
                <div className="space-y-1">
                  <span className="text-xs font-medium">Original Prompt:</span>
                  <div className="text-xs bg-blue-50 p-2 rounded max-h-16 overflow-auto">
                    {originalPrompt || 'No prompt provided'}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="mt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium">Lines</div>
                  <div className="text-lg">{stats.lines}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium">Nodes</div>
                  <div className="text-lg">{stats.nodes}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium">Connections</div>
                  <div className="text-lg">{stats.connections}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium">Type</div>
                  <div className="text-xs">{detectedDiagramType}</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};