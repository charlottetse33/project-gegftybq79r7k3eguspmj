import React, { useState } from 'react';
import { FlowchartPreview } from './FlowchartPreview';
import { useFlowchartGenerator } from '@/hooks/useFlowchartGenerator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Copy, Download, RefreshCw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const FlowchartBuilder: React.FC = () => {
  const [description, setDescription] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const { generateFlowchart, isGenerating, error, detectedDiagramType, clearError } = useFlowchartGenerator();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description for your diagram",
        variant: "destructive"
      });
      return;
    }

    try {
      clearError();
      const generatedCode = await generateFlowchart(description);
      setMermaidCode(generatedCode);
      toast({
        title: "Diagram Generated!",
        description: `Your ${detectedDiagramType.toLowerCase()} has been created successfully`
      });
    } catch (err) {
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Failed to generate diagram",
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
    a.download = 'diagram.mmd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Diagram saved as diagram.mmd"
    });
  };

  const exampleDescriptions = [
    {
      category: "Database & ER Diagrams",
      examples: [
        "E-commerce database with users, products, orders, and reviews",
        "Library management system with books, authors, members, and borrowing records",
        "Social media platform with users, posts, comments, and likes"
      ]
    },
    {
      category: "Process Flows",
      examples: [
        "User login process with authentication and error handling",
        "E-commerce checkout flow from cart to payment confirmation",
        "Customer support ticket resolution process"
      ]
    },
    {
      category: "System Interactions",
      examples: [
        "API authentication flow between client, server, and database",
        "Microservices communication for order processing",
        "User registration with email verification sequence"
      ]
    },
    {
      category: "Class Structures",
      examples: [
        "Object-oriented design for a vehicle management system",
        "Class hierarchy for a game with different character types",
        "MVC architecture with models, views, and controllers"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Diagram Builder
          </h1>
          <p className="text-lg text-gray-600">
            Describe any system, process, or structure and let AI create the perfect diagram for you
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <Info className="w-4 h-4" />
            <span>Supports ER diagrams, flowcharts, sequence diagrams, class diagrams, and more</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-blue-600" />
                Describe Your System or Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  placeholder="Describe what you want to visualize. For example: 'Database schema for a blog with users, posts, and comments' or 'User authentication flow with OAuth'"
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
                    Generate Diagram
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Example Descriptions */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Try these examples:</p>
                <div className="space-y-3">
                  {exampleDescriptions.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {category.category}
                      </p>
                      <div className="space-y-1">
                        {category.examples.map((example, index) => (
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
                  Diagram Preview
                  {detectedDiagramType && (
                    <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {detectedDiagramType}
                    </span>
                  )}
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