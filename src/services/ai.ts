import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({
    apiKey: (import.meta as any).env?.VITE_API_KEY || "",
  });
};

export const generateExam = async (
  blockTitle: string,
  lessonTexts: string[],
  numQuestions: number = 30
): Promise<Question[]> => {
  const ai = getAIClient();

  const combinedContext = lessonTexts.join("\n\n---\n\n");

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Actúa como un Evaluador Académico de Máster. Genera un examen oficial en ESPAÑOL basado EXCLUSIVAMENTE en el material de estudio proporcionado a continuación.

TÍTULO DEL EXAMEN: "${blockTitle}"

REGLA CRÍTICA: 
Las preguntas deben estar fundamentadas únicamente en el contenido, las definiciones, los ejemplos y las explicaciones de los textos adjuntos. NO utilices información externa que no aparezca en estos textos.

MATERIALES DE ESTUDIO:
${combinedContext}

REQUISITOS DEL EXAMEN:
- Crea exactamente ${numQuestions} preguntas.
- Nivel de dificultad: Máster Universitario (razonamiento técnico y conceptual).
- Cada pregunta debe tener 4 opciones (A, B, C, D) y solo una respuesta correcta.
- Formato: JSON con la estructura indicada.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctIndex: { type: Type.INTEGER },
          },
          required: ["question", "options", "correctIndex"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    throw new Error("Error al generar el examen.");
  }
};

export const generateLessonContent = async (
  lessonTitle: string,
  topic: string
): Promise<string> => {
  const ai = getAIClient();

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Actúa como el Autor Principal de un manual técnico avanzado de Inteligencia Artificial para nivel de Máster. Tu tarea es redactar un capítulo completo, riguroso y académico sobre: ${lessonTitle}.

CONTEXTO:
${topic}

OBJETIVO:
Generar material de estudio denso, técnico y directo. El texto debe ser puramente expositivo e informativo.

RESTRICCIONES NEGATIVAS:
- PROHIBIDO usar saludos o personalizaciones.
- PROHIBIDO usar conclusiones administrativas.
- NO actúes como un interlocutor.
- NO resumas el contenido principal, desglósalo en detalle.

REGLA CRÍTICA DE RESUMEN:
- Comienza el capítulo OBLIGATORIAMENTE con un bloque de Markdown tipo blockquote marcado como "**RESUMEN EJECUTIVO:**".
- Este resumen debe constar de exactamente 2-3 frases de alto nivel que capturen la esencia técnica y los objetivos de aprendizaje del capítulo.

ESTRUCTURA DEL CAPÍTULO:
0. RESUMEN EJECUTIVO (Bloque inicial)
1. Introducción y Contexto Histórico
2. Marco Teórico y Fundamentos Epistemológicos
3. Arquitecturas y Desarrollo Técnico
4. Casos de Uso e Implementación Industrial
5. Análisis Crítico y Limitaciones Técnicas
6. Ética y Gobernanza
7. Conclusiones y Futuras Líneas de Investigación

Comienza a escribir directamente el RESUMEN EJECUTIVO seguido del Título 1.`,
  });

  return response.text || "No se pudo generar el contenido.";
};

export const expandSectionContent = async (
  lessonTitle: string,
  sectionTitle: string
): Promise<string> => {
  const ai = getAIClient();

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Actúa como el Autor Principal del manual técnico avanzado de IA. Amplía EXTENSAMENTE el siguiente apartado del capítulo "${lessonTitle}":

APARTADO A AMPLIAR: "${sectionTitle}"

OBJETIVO:
Proporcionar una profundidad técnica superior, incluyendo más ejemplos de código, fórmulas detalladas y casos específicos.

RESTRICCIONES:
- Tono impersonal (voz pasiva/se impersonal).
- NO uses saludos ni despedidas.
- Usa Markdown avanzado.`,
  });

  return response.text || "No se pudo expandir la sección.";
};
