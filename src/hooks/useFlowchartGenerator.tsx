import { useState } from 'react';
import { invokeLLM } from '@/integrations/core';

export const useFlowchartGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedDiagramType, setDetectedDiagramType] = useState<string>('');

  const generateFlowchart = async (description: string): Promise<string> => {
    if (!description.trim()) {
      throw new Error('Please provide a description for the diagram');
    }

    setIsGenerating(true);
    setError(null);
    setDetectedDiagramType('');

    try {
      const prompt = `
        Analyze the following description and generate the appropriate Mermaid diagram: "${description}"
        
        Based on the description, determine the most suitable diagram type:
        - If it describes database relationships, entities, or data models: use "erDiagram"
        - If it describes interactions between actors/systems over time: use "sequenceDiagram"
        - If it describes class structures, inheritance, or OOP concepts: use "classDiagram"
        - If it describes a process, workflow, or decision flow: use "flowchart TD" or "flowchart LR"
        - If it describes a timeline or project phases: use "gantt"
        - If it describes states and transitions: use "stateDiagram-v2"
        - If it describes a user journey or experience: use "journey"
        - If it describes network or system architecture: use "graph TD"

        Requirements:
        - Use proper Mermaid syntax for the detected diagram type
        - Use clear, descriptive labels
        - Make it visually clear and easy to understand
        - Only return the Mermaid code, no explanations or markdown formatting
        - Start with the appropriate diagram declaration

        Examples:
        
        For ER Diagram:
        erDiagram
            CUSTOMER ||--o{ ORDER : places
            ORDER ||--|{ LINE-ITEM : contains
            CUSTOMER {
                string name
                string email
                string phone
            }

        For Sequence Diagram:
        sequenceDiagram
            participant A as User
            participant B as System
            A->>B: Request
            B-->>A: Response

        For Class Diagram:
        classDiagram
            class Animal {
                +String name
                +makeSound()
            }
            Animal <|-- Dog

        For Flowchart:
        flowchart TD
            A[Start] --> B{Decision?}
            B -->|Yes| C[Action]
            B -->|No| D[Alternative]

        Generate the appropriate diagram:
      `;

      const response = await invokeLLM({
        prompt,
        add_context_from_internet: false
      });

      if (typeof response !== 'string') {
        throw new Error('Invalid response from AI service');
      }

      // Clean up the response to ensure it's valid Mermaid syntax
      let mermaidCode = response.trim();
      
      // Remove any markdown code blocks if present
      mermaidCode = mermaidCode.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '');
      
      // Detect diagram type from the generated code
      const diagramTypes = {
        'erDiagram': 'Entity Relationship Diagram',
        'sequenceDiagram': 'Sequence Diagram',
        'classDiagram': 'Class Diagram',
        'flowchart': 'Flowchart',
        'gantt': 'Gantt Chart',
        'stateDiagram': 'State Diagram',
        'journey': 'User Journey',
        'graph': 'Graph Diagram'
      };

      let detectedType = 'Diagram';
      for (const [key, value] of Object.entries(diagramTypes)) {
        if (mermaidCode.toLowerCase().includes(key.toLowerCase())) {
          detectedType = value;
          break;
        }
      }
      
      setDetectedDiagramType(detectedType);

      return mermaidCode;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate diagram';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateFlowchart,
    isGenerating,
    error,
    detectedDiagramType,
    clearError: () => setError(null)
  };
};