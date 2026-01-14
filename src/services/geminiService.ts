
import { GoogleGenAI, Type } from "@google/genai";

// Always use the process.env.API_KEY directly for initialization as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * Predicts the category of a purchase based on its description
   */
  async categorizePurchase(description: string, existingCategories: string[]): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Categorize a seguinte compra baseada nestas categorias: ${existingCategories.join(', ')}. Descrição: "${description}". Responda apenas o nome da categoria.`,
        config: {
          temperature: 0.1,
        }
      });
      
      // Fixed: Use the .text property to access the response content directly.
      const category = response.text?.trim();
      return existingCategories.find(c => c.toLowerCase() === category?.toLowerCase()) || 'Outros';
    } catch (error) {
      console.error('Categorization error:', error);
      return 'Outros';
    }
  },

  /**
   * Extracts purchase data from raw invoice text
   */
  async parseBulkPurchases(text: string, year: number): Promise<any[]> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extraia todas as compras do seguinte texto de fatura de cartão de crédito. Use o ano ${year}. Texto: "${text}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING, description: 'Nome ou descrição do item' },
                amount: { type: Type.NUMBER, description: 'Valor numérico total da compra' },
                purchaseDate: { type: Type.STRING, description: 'Data no formato ISO YYYY-MM-DD' },
                installments: { type: Type.INTEGER, description: 'Número total de parcelas (ex: 1 se for à vista)' },
              },
              required: ['item', 'amount', 'purchaseDate', 'installments'],
            }
          }
        }
      });

      // Fixed: Use the .text property to access the response content directly.
      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error('Bulk parsing error:', error);
      return [];
    }
  }
};
