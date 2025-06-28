import React, { useState } from 'react';
import { FlowchartPreview } from './FlowchartPreview';
import { useFlowchartGenerator } from '@/hooks/useFlowchartGenerator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Copy, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const FlowchartBuilder: React.FC = () => {
  const [description, setDescription] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const { generateFlowchart, isGenerating, error, clearError } = useFlowchartGenerator();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description for your flowchart",
        variant: "destructive"
      });
      return;
    }

    try {
      clearError();
      const generatedCode = await generateFlowchart(description);
      setMermaidCode(generatedCode);
      toast({
        title: "Flowchart Generated!",
        description: "Your flowchart has been created successfully"
      });
    } catch (err) {
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Failed to generate flowchart",
        variant: "destructive"
      });
    }
  };

  const handleCopyCode = async () => {
    if (!mermaidCode) return;
    
    try {
      await navigator.clipboard.writeText(mermaidCode);
      toast({
        title: "Copied!",
        description: "Mermaid code copied to clipboard"
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (!mermaidCode) return;
    
    const blob = new Blob([mermaidCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.mmd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Flowchart saved as flowchart.mmd"
    });
  };

  const exampleDescriptions = [
    "User login process with authentication and error handling",
    "E-commerce checkout flow from cart to payment confirmation",
    "Software development lifecycle from planning to deployment",
    "Customer support ticket resolution process"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Flowchart Builder
          </h1>
          <p className="text-lg text-gray-600">
            Describe your process and let AI create beautiful flowcharts for you
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-blue-600" />
                Describe Your Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  placeholder="Describe the process you want to visualize as a flowchart. For example: 'User registration process with email verification and profile setup'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-32 resize-none"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Flowchart
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Example Descriptions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Try these examples:</p>
                <div className="space-y-1">
                  {exampleDescriptions.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setDescription(example)}
                      className="text-left text-sm text-blue-600 hover:text-blue-800 hover:underline block w-full"
                    >
                      • {example}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Flowchart Preview
                </CardTitle>
                {mermaidCode && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-1" />
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

        {/* Generated Code Section */}
        {mermaidCode && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Generated Mermaid Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap">{mermaidCode}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};