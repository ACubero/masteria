import React from "react";
import { Cpu, Database, Layers, Code2, Sparkles } from "lucide-react";
import { Block, ProcessingState } from "../types";

export const CURRICULUM: Block[] = [
  {
    id: 1,
    title: "Fundamentos de la Inteligencia Artificial",
    description:
      "Conceptos introductorios, historia y los pilares matemáticos de la IA.",
    lessons: [
      {
        id: "1-1",
        title: "Historia y Evolución de la IA",
        topic:
          "Origen desde Turing hasta los LLM modernos, inviernos de la IA y hitos clave.",
      },
      {
        id: "1-2",
        title: "Álgebra Lineal y Cálculo para IA",
        topic: "Vectores, matrices, tensores y el gradiente descendente.",
      },
      {
        id: "1-3",
        title: "Probabilidad y Estadística",
        topic:
          "Teorema de Bayes, distributions y manejo de la incertidumbre en datos.",
      },
      {
        id: "1-4",
        title: "Python para Ciencia de Datos",
        topic: "Librerías esenciales: NumPy, Pandas y visualización básica.",
      },
    ],
  },
  {
    id: 2,
    title: "Fundamentos de Machine Learning",
    description: "Técnicas de aprendizaje supervisado y no supervisado.",
    lessons: [
      {
        id: "2-1",
        title: "Análisis de Regresión",
        topic:
          "Regresión lineal y polinómica, funciones de coste y optimización.",
      },
      {
        id: "2-2",
        title: "Algoritmos de Clasificación",
        topic: "Regresión logística, SVM y árboles de decisión.",
      },
      {
        id: "2-3",
        title: "Clustering y Reducción de Dimensionalidad",
        topic: "K-Means, PCA y técnicas de agrupamiento.",
      },
      {
        id: "2-4",
        title: "Métodos de Conjunto (Ensemble)",
        topic: "Random Forests y algoritmos de boosting como XGBoost.",
      },
    ],
  },
  {
    id: 3,
    title: "Deep Learning y Redes Neuronales",
    description: "La arquitectura de los cerebros artificiales.",
    lessons: [
      {
        id: "3-1",
        title: "Perceptrón Multicapa",
        topic:
          "Funciones de activación (ReLU, Sigmoid) y propagación hacia adelante.",
      },
      {
        id: "3-2",
        title: "Backpropagation en Detalle",
        topic: "Regla de la cadena y actualización de pesos en la red.",
      },
      {
        id: "3-3",
        title: "Técnicas de Regularización",
        topic: "Dropout, Batch Normalization y prevención del sobreajuste.",
      },
      {
        id: "3-4",
        title: "Algoritmos de Optimización",
        topic: "Adam, RMSprop y estrategias de tasa de aprendizaje.",
      },
    ],
  },
  {
    id: 4,
    title: "Procesamiento de Lenguaje Natural (NLP) y LLMs",
    description:
      "Procesamiento del lenguaje humano y la revolución de los Transformers.",
    lessons: [
      {
        id: "4-1",
        title: "Preprocesamiento y Embeddings",
        topic:
          "Tokenización, Word2Vec y representación vectorial del lenguaje.",
      },
      {
        id: "4-2",
        title: "Modelos de Secuencia",
        topic: "RNNs, LSTMs y las limitaciones de la memoria secuencial.",
      },
      {
        id: "4-3",
        title: "Arquitectura Transformer",
        topic:
          "Mecanismo de atención (Self-attention) y estructura Encoder-Decoder.",
      },
      {
        id: "4-4",
        title: "Modelos de Lenguaje de Gran Escala (LLMs)",
        topic: "Fine-tuning, Prompt Engineering y RAG.",
      },
    ],
  },
  {
    id: 5,
    title: "Visión por Computador y IA Generativa",
    description: "Percepción visual y creación de contenidos.",
    lessons: [
      {
        id: "5-1",
        title: "Redes Neuronales Convolucionales (CNNs)",
        topic: "Filtros, kernels y extracción de características visuales.",
      },
      {
        id: "5-2",
        title: "Detección y Segmentación de Objetos",
        topic: "Arquitecturas YOLO, R-CNN y segmentación semántica.",
      },
      {
        id: "5-3",
        title: "Redes Generativas Antagónicas (GANs)",
        topic: "Competición entre generador y discriminador.",
      },
      {
        id: "5-4",
        title: "Modelos de Difusión",
        topic:
          "Funcionamiento de Stable Diffusion y generación de imagen a partir de texto.",
      },
    ],
  },
  {
    id: 6,
    title: "Ética, Gobernanza y el Futuro (AGI)",
    description: "Impacto social, legal y futuro de la inteligencia.",
    lessons: [
      {
        id: "6-1",
        title: "Sesgo y Equidad en IA",
        topic:
          "Identificación de prejuicios en datos y mitigación de sesgos algorítmicos.",
      },
      {
        id: "6-2",
        title: "Seguridad y Alineación de la IA",
        topic: "Alineamiento de objetivos de la IA con valores humanos.",
      },
      {
        id: "6-3",
        title: "Marco Regulatorio Global",
        topic: "Ley de IA de la UE y gobernanza internacional.",
      },
      {
        id: "6-4",
        title: "Hacia la Inteligencia Artificial General (AGI)",
        topic:
          "Teorías sobre la superinteligencia y retos actuales para alcanzarla.",
      },
    ],
  },
];

export const ProcessingStates: ProcessingState[] = [
  {
    icon: React.createElement(Cpu, { size: 32 }),
    text: "Sintetizando fundamentos teóricos...",
  },
  {
    icon: React.createElement(Database, { size: 32 }),
    text: "Analizando conjuntos de datos y arquitecturas...",
  },
  {
    icon: React.createElement(Layers, { size: 32 }),
    text: "Estructurando jerarquías de aprendizaje profundo...",
  },
  {
    icon: React.createElement(Code2, { size: 32 }),
    text: "Compilando implementaciones técnicas y algoritmos...",
  },
  {
    icon: React.createElement(Sparkles, { size: 32 }),
    text: "Afinando rigor académico y gobernanza ética...",
  },
];

export const FONT_SIZES = [
  { label: "Normal", value: "1.125rem" },
  { label: "Grande", value: "1.35rem" },
  { label: "Extra", value: "1.6rem" },
  { label: "Máximo", value: "1.85rem" },
];

export const DB_NAME = "MasterIADB";
export const STORE_NAME = "AppState";
export const DB_VERSION = 1;
