import { useState } from 'react';
import { invokeLLM } from '@/integrations/core';

export const useFlowchartGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFlowchart = async (description: string): Promise<string> => {
    if (!description.trim()) {
      throw new Error('Please provide a description for the flowchart');
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `
        Generate a Mermaid flowchart based on the following description: "${description}"
        
        Requirements:
        - Use proper Mermaid flowchart syntax
        - Start with "flowchart TD" or "flowchart LR" 
        - Use clear, descriptive node labels
        - Include appropriate decision points if needed
        - Use proper arrow connections (-->)
        - Make it visually clear and easy to understand
        - Only return the Mermaid code, no explanations or markdown formatting
        
        Example format:
        flowchart TD
            A[Start] --> B{Decision?}
            B -->|Yes| C[Action 1]
            B -->|No| D[Action 2]
            C --> E[End]
            D --> E
        
        Generate the flowchart:
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
      
      // Ensure it starts with flowchart
      if (!mermaidCode.startsWith('flowchart')) {
        mermaidCode = 'flowchart TD\n' + mermaidCode;
      }

      return mermaidCode;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate flowchart';
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
    clearError: () => setError(null)
  };
};