
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, 
  Lock, 
  CheckCircle, 
  ChevronLeft,
  ChevronRight, 
  Trophy, 
  Brain, 
  GraduationCap, 
  Loader2, 
  AlertCircle,
  Menu,
  X,
  PlayCircle,
  Sparkles,
  Award,
  Star,
  Download,
  User,
  PlusCircle,
  Maximize2,
  List,
  Info,
  Cpu,
  Database,
  Code2,
  Layers,
  Save,
  RotateCcw,
  Clock,
  UserCircle,
  Type as TypeIcon
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';

// --- UTILIDADES DE INDEXEDDB ---

const DB_NAME = 'MasterIADB';
const STORE_NAME = 'AppState';
const DB_VERSION = 1;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveToIDB = async (key: string, val: any) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(val, key);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

const getFromIDB = async (key: string) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const request = tx.objectStore(STORE_NAME).get(key);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const clearIDB = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

// --- ESTRUCTURAS DE DATOS ---

interface Lesson {
  id: string;
  title: string;
  topic: string;
}

interface Block {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

const CURRICULUM: Block[] = [
  {
    id: 1,
    title: "Fundamentos de la Inteligencia Artificial",
    description: "Conceptos introductorios, historia y los pilares matemáticos de la IA.",
    lessons: [
      { id: "1-1", title: "Historia y Evolución de la IA", topic: "Origen desde Turing hasta los LLM modernos, inviernos de la IA y hitos clave." },
      { id: "1-2", title: "Álgebra Lineal y Cálculo para IA", topic: "Vectores, matrices, tensores y el gradiente descendente." },
      { id: "1-3", title: "Probabilidad y Estadística", topic: "Teorema de Bayes, distributions y manejo de la incertidumbre en datos." },
      { id: "1-4", title: "Python para Ciencia de Datos", topic: "Librerías esenciales: NumPy, Pandas y visualización básica." }
    ]
  },
  {
    id: 2,
    title: "Fundamentos de Machine Learning",
    description: "Técnicas de aprendizaje supervisado y no supervisado.",
    lessons: [
      { id: "2-1", title: "Análisis de Regresión", topic: "Regresión lineal y polinómica, funciones de coste y optimización." },
      { id: "2-2", title: "Algoritmos de Clasificación", topic: "Regresión logística, SVM y árboles de decisión." },
      { id: "2-3", title: "Clustering y Reducción de Dimensionalidad", topic: "K-Means, PCA y técnicas de agrupamiento." },
      { id: "2-4", title: "Métodos de Conjunto (Ensemble)", topic: "Random Forests y algoritmos de boosting como XGBoost." }
    ]
  },
  {
    id: 3,
    title: "Deep Learning y Redes Neuronales",
    description: "La arquitectura de los cerebros artificiales.",
    lessons: [
      { id: "3-1", title: "Perceptrón Multicapa", topic: "Funciones de activación (ReLU, Sigmoid) y propagación hacia adelante." },
      { id: "3-2", title: "Backpropagation en Detalle", topic: "Regla de la cadena y actualización de pesos en la red." },
      { id: "3-3", title: "Técnicas de Regularización", topic: "Dropout, Batch Normalization y prevención del sobreajuste." },
      { id: "3-4", title: "Algoritmos de Optimización", topic: "Adam, RMSprop y estrategias de tasa de aprendizaje." }
    ]
  },
  {
    id: 4,
    title: "Procesamiento de Lenguaje Natural (NLP) y LLMs",
    description: "Procesamiento del lenguaje humano y la revolución de los Transformers.",
    lessons: [
      { id: "4-1", title: "Preprocesamiento y Embeddings", topic: "Tokenización, Word2Vec y representación vectorial del lenguaje." },
      { id: "4-2", title: "Modelos de Secuencia", topic: "RNNs, LSTMs y las limitaciones de la memoria secuencial." },
      { id: "4-3", title: "Arquitectura Transformer", topic: "Mecanismo de atención (Self-attention) y estructura Encoder-Decoder." },
      { id: "4-4", title: "Modelos de Lenguaje de Gran Escala (LLMs)", topic: "Fine-tuning, Prompt Engineering y RAG." }
    ]
  },
  {
    id: 5,
    title: "Visión por Computador y IA Generativa",
    description: "Percepción visual y creación de contenidos.",
    lessons: [
      { id: "5-1", title: "Redes Neuronales Convolucionales (CNNs)", topic: "Filtros, kernels y extracción de características visuales." },
      { id: "5-2", title: "Detección y Segmentación de Objetos", topic: "Arquitecturas YOLO, R-CNN y segmentación semántica." },
      { id: "5-3", title: "Redes Generativas Antagónicas (GANs)", topic: "Competición entre generador y discriminador." },
      { id: "5-4", title: "Modelos de Difusión", topic: "Funcionamiento de Stable Diffusion y generación de imagen a partir de texto." }
    ]
  },
  {
    id: 6,
    title: "Ética, Gobernanza y el Futuro (AGI)",
    description: "Impacto social, legal y futuro de la inteligencia.",
    lessons: [
      { id: "6-1", title: "Sesgo y Equidad en IA", topic: "Identificación de prejuicios en datos y mitigación de sesgos algorítmicos." },
      { id: "6-2", title: "Seguridad y Alineación de la IA", topic: "Alineamiento de objetivos de la IA con valores humanos." },
      { id: "6-3", title: "Marco Regulatorio Global", topic: "Ley de IA de la UE y gobernanza internacional." },
      { id: "6-4", title: "Hacia la Inteligencia Artificial General (AGI)", topic: "Teorías sobre la superinteligencia y retos actuales para alcanzarla." }
    ]
  }
];

// --- UTILIDADES DE IA ---

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

const generateExam = async (blockTitle: string, lessonTexts: string[], numQuestions: number = 30): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const combinedContext = lessonTexts.join("\n\n---\n\n");

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
            correctIndex: { type: Type.INTEGER }
          },
          required: ["question", "options", "correctIndex"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    throw new Error("Error al generar el examen.");
  }
};

const generateLessonContent = async (lessonTitle: string, topic: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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

const expandSectionContent = async (lessonTitle: string, sectionTitle: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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

// --- COMPONENTES ---

const ProcessingStates = [
  { icon: <Cpu size={32} />, text: "Sintetizando fundamentos teóricos..." },
  { icon: <Database size={32} />, text: "Analizando conjuntos de datos y arquitecturas..." },
  { icon: <Layers size={32} />, text: "Estructurando jerarquías de aprendizaje profundo..." },
  { icon: <Code2 size={32} />, text: "Compilando implementaciones técnicas y algoritmos..." },
  { icon: <Sparkles size={32} />, text: "Afinando rigor académico y gobernanza ética..." }
];

const LoadingPlaceholder = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ProcessingStates.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 sm:py-40 space-y-10 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative bg-slate-900 p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-indigo-900 flex items-center justify-center">
          <div className="text-indigo-400 animate-bounce-slow">
            {ProcessingStates[index].icon}
          </div>
          <div className="absolute -inset-2 border-2 border-indigo-800 border-dashed rounded-[3.2rem] animate-spin-slow"></div>
        </div>
      </div>
      
      <div className="text-center space-y-6 max-w-sm mx-auto">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight transition-all duration-700 h-20 sm:h-auto flex items-center justify-center">
          {ProcessingStates[index].text}
        </h3>
        <div className="flex justify-center gap-2">
          {ProcessingStates.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-700 ${i === index ? 'w-12 bg-indigo-500' : 'w-2 bg-slate-800'}`} 
            />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Gemini 3.0 Pro Academic Engine
        </p>
      </div>

      <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 animate-progress"></div>
      </div>
    </div>
  );
};

// Tamaños de fuente disponibles - Aumentados
const FONT_SIZES = [
  { label: 'Normal', value: '1.125rem' },
  { label: 'Grande', value: '1.35rem' },
  { label: 'Extra', value: '1.6rem' },
  { label: 'Máximo', value: '1.85rem' }
];

const App = () => {
  // Estados de Progresión
  const [isHydrated, setIsHydrated] = useState(false);
  const [unlockedBlocks, setUnlockedBlocks] = useState<number[]>([1]);
  const [completedBlocks, setCompletedBlocks] = useState<number[]>([]);
  const [currentBlockId, setCurrentBlockId] = useState<number>(1);
  const [currentLessonId, setCurrentLessonId] = useState<string>("1-1");
  const [masterCompleted, setMasterCompleted] = useState<boolean>(false);
  const [studentName, setStudentName] = useState("Alumno Invitado");
  const [fontSize, setFontSize] = useState("1.35rem");
  
  // Caché de lecciones generadas
  const [lessonCache, setLessonCache] = useState<Record<string, string>>({});
  const [expandedCache, setExpandedCache] = useState<Record<string, Record<string, string>>>({});
  
  // Estados de carga
  const [lessonLoading, setLessonLoading] = useState(false);
  const [expandingSections, setExpandingSections] = useState<Record<string, boolean>>({});
  
  // Estados de Examen
  const [examMode, setExamMode] = useState(false);
  const [finalMasterExam, setFinalMasterExam] = useState(false);
  const [examLoading, setExamLoading] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examResult, setExamResult] = useState<{ score: number; passed: boolean } | null>(null);

  // Estados de UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number>(Date.now());
  const [showResumedNotice, setShowResumedNotice] = useState(false);

  // Carga inicial desde IndexedDB
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved: any = await getFromIDB('current');
        if (saved) {
          setUnlockedBlocks(saved.unlockedBlocks || [1]);
          setCompletedBlocks(saved.completedBlocks || []);
          setCurrentBlockId(saved.currentBlockId || 1);
          setCurrentLessonId(saved.currentLessonId || "1-1");
          setMasterCompleted(saved.masterCompleted || false);
          setStudentName(saved.studentName || "Alumno Invitado");
          setFontSize(saved.fontSize || "1.35rem");
          setLessonCache(saved.lessonCache || {});
          setExpandedCache(saved.expandedCache || {});
          setExamMode(saved.examMode || false);
          setFinalMasterExam(saved.finalMasterExam || false);
          setExamQuestions(saved.examQuestions || []);
          setExamAnswers(saved.examAnswers || {});
          setExamResult(saved.examResult || null);
          setShowResumedNotice(true);
        }
      } catch (e) {
        console.error("Error cargando el estado desde IndexedDB:", e);
      } finally {
        setIsHydrated(true);
      }
    };
    loadState();
  }, []);

  // Guardado automático en IndexedDB
  useEffect(() => {
    if (!isHydrated) return;

    const stateToSave = {
      unlockedBlocks,
      completedBlocks,
      currentBlockId,
      currentLessonId,
      masterCompleted,
      studentName,
      fontSize,
      lessonCache,
      expandedCache,
      examMode,
      finalMasterExam,
      examQuestions,
      examAnswers,
      examResult,
      savedAt: Date.now()
    };
    
    saveToIDB('current', stateToSave).then(() => {
      setLastSavedAt(Date.now());
    });
  }, [
    isHydrated, unlockedBlocks, completedBlocks, currentBlockId, currentLessonId, 
    masterCompleted, studentName, fontSize, lessonCache, expandedCache,
    examMode, finalMasterExam, examQuestions, examAnswers, examResult
  ]);

  const currentBlock = useMemo(() => CURRICULUM.find(b => b.id === currentBlockId)!, [currentBlockId]);
  const currentLesson = useMemo(() => currentBlock.lessons.find(l => l.id === currentLessonId)!, [currentBlock, currentLessonId]);
  
  const totalLessons = CURRICULUM.reduce((acc, b) => acc + b.lessons.length, 0);
  const progressPercent = Math.round(((completedBlocks.length * 4 + (masterCompleted ? 4 : 0)) / (totalLessons + 4)) * 100);

  // Ocultar notificación de progreso recuperado tras 5 segundos
  useEffect(() => {
    if (showResumedNotice) {
      const timer = setTimeout(() => setShowResumedNotice(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showResumedNotice]);

  // Bloqueo de scroll cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isSidebarOpen]);

  const selectLesson = (blockId: number, lessonId: string) => {
    setCurrentBlockId(blockId);
    setCurrentLessonId(lessonId);
    setExamMode(false);
    setFinalMasterExam(false);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isHydrated && !lessonCache[currentLessonId] && !examMode && !finalMasterExam) {
      loadLesson();
    }
  }, [isHydrated, currentLessonId, examMode, finalMasterExam]);

  const loadLesson = async () => {
    setLessonLoading(true);
    try {
      const content = await generateLessonContent(currentLesson.title, currentLesson.topic);
      setLessonCache(prev => ({ ...prev, [currentLessonId]: content }));
    } catch (err) {
      console.error(err);
    } finally {
      setLessonLoading(false);
    }
  };

  const handleExpand = async (sectionTitle: string) => {
    if (expandingSections[sectionTitle]) return;
    
    setExpandingSections(prev => ({ ...prev, [sectionTitle]: true }));
    try {
      const expandedText = await expandSectionContent(currentLesson.title, sectionTitle);
      setExpandedCache(prev => ({
        ...prev,
        [currentLessonId]: {
          ...(prev[currentLessonId] || {}),
          [sectionTitle]: expandedText
        }
      }));
    } catch (err) {
      alert("Error al ampliar la sección.");
    } finally {
      setExpandingSections(prev => ({ ...prev, [sectionTitle]: false }));
    }
  };

  const handleStartExam = async (isFinal: boolean = false) => {
    setExamLoading(true);
    setExamMode(true);
    setFinalMasterExam(isFinal);
    setExamQuestions([]);
    setExamAnswers({});
    setExamResult(null);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      let title = currentBlock.title;
      let lessonTexts: string[] = [];

      if (isFinal) {
        title = "EXAMEN FINAL DE MÁSTER";
        // Collect all texts from all lessons in the curriculum available in cache
        CURRICULUM.forEach(b => {
          b.lessons.forEach(l => {
            if (lessonCache[l.id]) {
              lessonTexts.push(`--- LECCIÓN: ${l.title} ---\n${lessonCache[l.id]}`);
              // Include expanded content if available
              if (expandedCache[l.id]) {
                Object.entries(expandedCache[l.id]).forEach(([section, expanded]) => {
                  lessonTexts.push(`--- AMPLIACIÓN: ${section} ---\n${expanded}`);
                });
              }
            }
          });
        });
      } else {
        // Collect texts for the current block's lessons
        currentBlock.lessons.forEach(l => {
          if (lessonCache[l.id]) {
            lessonTexts.push(`--- LECCIÓN: ${l.title} ---\n${lessonCache[l.id]}`);
            if (expandedCache[l.id]) {
              Object.entries(expandedCache[l.id]).forEach(([section, expanded]) => {
                lessonTexts.push(`--- AMPLIACIÓN: ${section} ---\n${expanded}`);
              });
            }
          }
        });
      }

      // If no texts are available (unlikely in normal flow), add titles as fallback
      if (lessonTexts.length === 0) {
        lessonTexts = CURRICULUM.find(b => b.id === currentBlockId)?.lessons.map(l => l.title) || [];
      }

      const questions = await generateExam(title, lessonTexts, isFinal ? 10 : 30);
      setExamQuestions(questions);
    } catch (err) {
      console.error(err);
      alert("Error al cargar el examen. Por favor, asegúrate de haber visualizado las lecciones del bloque.");
      setExamMode(false);
    } finally {
      setExamLoading(false);
    }
  };

  const handleSubmitExam = () => {
    let score = 0;
    examQuestions.forEach((q, idx) => {
      if (examAnswers[idx] === q.correctIndex) score++;
    });

    const threshold = finalMasterExam ? 7 : 24; 
    const passed = score >= threshold; 
    setExamResult({ score, passed });

    if (passed) {
      if (finalMasterExam) {
        setMasterCompleted(true);
      } else {
        setCompletedBlocks(prev => Array.from(new Set([...prev, currentBlockId])));
        const nextBlockId = currentBlockId + 1;
        if (nextBlockId <= CURRICULUM.length) {
          setUnlockedBlocks(prev => Array.from(new Set([...prev, nextBlockId])));
        }
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeExam = () => {
    setExamMode(false);
    setFinalMasterExam(false);
    setExamResult(null);
    setExamAnswers({});
    setExamQuestions([]);
  };

  const goToNextLesson = () => {
    const currentIndex = currentBlock.lessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex < currentBlock.lessons.length - 1) {
      selectLesson(currentBlockId, currentBlock.lessons[currentIndex + 1].id);
    }
  };

  const goToPrevLesson = () => {
    const currentIndex = currentBlock.lessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex > 0) {
      selectLesson(currentBlockId, currentBlock.lessons[currentIndex - 1].id);
    }
  };

  const isLastLessonOfBlock = currentBlock.lessons.findIndex(l => l.id === currentLessonId) === currentBlock.lessons.length - 1;
  const isFirstLessonOfBlock = currentBlock.lessons.findIndex(l => l.id === currentLessonId) === 0;

  const downloadCertificate = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setTextColor(248, 250, 252);
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.text('TÍTULO DE MÁSTER', pageWidth / 2, 50, { align: 'center' });
    doc.setFontSize(20);
    doc.text('En Inteligencia Artificial', pageWidth / 2, 65, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Por la presente se certifica que', pageWidth / 2, 85, { align: 'center' });
    doc.setTextColor(129, 140, 248); // indigo-400
    doc.setFontSize(32);
    doc.text(studentName.toUpperCase(), pageWidth / 2, 105, { align: 'center' });
    doc.save(`Certificado_Master_IA_${studentName.replace(/\s+/g, '_')}.pdf`);
  };

  const MarkdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 mb-8 mt-16" {...props} />,
    h2: ({node, children, ...props}: any) => {
      const title = String(children);
      const isExpanding = expandingSections[title];
      const hasExpanded = expandedCache[currentLessonId]?.[title];

      return (
        <div className="group/section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 mt-12 border-b-2 border-slate-800 pb-3 gap-3">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-100 m-0" {...props}>{children}</h2>
            {!hasExpanded && (
              <button 
                onClick={() => handleExpand(title)}
                disabled={isExpanding}
                className={`flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all disabled:cursor-not-allowed w-fit ${
                  isExpanding 
                    ? 'bg-indigo-600 text-white animate-pulse shadow-lg' 
                    : 'bg-indigo-900/40 text-indigo-400 border border-indigo-800 hover:bg-indigo-900/60'
                }`}
              >
                {isExpanding ? <Loader2 size={16} className="animate-spin" /> : <Maximize2 size={16} />}
                {isExpanding ? "Analizando..." : "Profundizar"}
              </button>
            )}
          </div>
          {hasExpanded && (
            <div className="bg-slate-800/40 border-l-[6px] border-indigo-500 p-6 sm:p-10 my-10 rounded-r-3xl animate-in slide-in-from-left duration-500">
              <div className="flex items-center gap-3 mb-6 text-indigo-400">
                <Sparkles size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">Ampliación Académica Superior</span>
              </div>
              <div className="prose-base sm:prose-xl prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{hasExpanded}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      );
    },
    h3: ({node, children, ...props}: any) => {
      const title = String(children);
      const isExpanding = expandingSections[title];
      const hasExpanded = expandedCache[currentLessonId]?.[title];
      
      return (
        <div className="group/section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 mt-10 gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-200 m-0" {...props}>{children}</h3>
            {!hasExpanded && (
              <button 
                onClick={() => handleExpand(title)}
                disabled={isExpanding}
                className={`flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 w-fit ${
                  isExpanding 
                    ? 'bg-slate-700 text-white animate-pulse' 
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300 border border-slate-700'
                }`}
              >
                {isExpanding ? <Loader2 size={12} className="animate-spin" /> : <PlusCircle size={12} />}
                {isExpanding ? "Cargando..." : "Detalle"}
              </button>
            )}
          </div>
          {hasExpanded && (
            <div className="bg-indigo-950/20 border-l-4 border-indigo-700 p-6 my-6 rounded-r-2xl prose-base prose-invert animate-in slide-in-from-top duration-300">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>{hasExpanded}</ReactMarkdown>
            </div>
          )}
        </div>
      );
    },
    blockquote: ({node, ...props}: any) => (
      <div className="relative my-12 group/quote">
        <div className="absolute -left-6 top-0 bottom-0 w-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-900"></div>
        <blockquote className="bg-slate-800/60 p-8 sm:p-12 rounded-3xl sm:rounded-[3rem] border border-slate-800 backdrop-blur-sm" {...props} />
        <div className="absolute -top-4 -right-4 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform">
          <Info size={24} />
        </div>
      </div>
    ),
    p: ({node, ...props}: any) => <p className="text-slate-400 leading-relaxed mb-8 text-base sm:text-xl" {...props} />,
    code: ({node, inline, className, children, ...props}: any) => {
      return !inline ? (
        <pre className="bg-black/40 text-slate-200 p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] overflow-x-auto my-10 text-sm sm:text-lg font-mono shadow-2xl border border-slate-800 relative group/code">
          <div className="absolute right-6 top-6 text-slate-600 text-[11px] font-black uppercase tracking-widest opacity-0 group-hover/code:opacity-100 transition-opacity">
            Kernel Snippet v3.0
          </div>
          <code {...props}>{children}</code>
        </pre>
      ) : (
        <code className="bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded-lg font-bold text-xs sm:text-base border border-indigo-800/30" {...props}>{children}</code>
      );
    }
  };

  if (!isHydrated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-6">
          <div className="p-6 bg-indigo-600 rounded-3xl text-white inline-block animate-bounce shadow-2xl shadow-indigo-500/20">
            <GraduationCap size={56} />
          </div>
          <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">Inicializando Entorno Élite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative text-slate-100">
      {/* Sidebar Backdrop para Móvil */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-40 transition-opacity duration-300 lg:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Notificación de Progreso Recuperado */}
      {showResumedNotice && (
        <div className="fixed top-28 left-1/2 transform -translate-x-1/2 z-[60] animate-in slide-in-from-top duration-700 w-[calc(100%-3rem)] max-w-md">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 backdrop-blur-md">
            <Clock size={20} className="text-indigo-400 shrink-0" />
            <span className="text-sm font-bold">Base de datos local sincronizada con éxito</span>
            <button onClick={() => setShowResumedNotice(false)} className="p-1.5 hover:bg-slate-800 rounded-xl ml-auto">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Navegación Lateral (Sidebar) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[300px] sm:w-[350px] bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out transform 
        lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
       flex flex-col glass`}>
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="font-black text-slate-100 tracking-tight leading-none text-base">MÁSTER IA</h1>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Portal Académico</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:text-slate-300 lg:hidden" aria-label="Cerrar menú">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Perfil del Estudiante */}
          <div className="mb-8 px-2">
            <div className="flex items-center gap-2 mb-4 text-xs font-black text-slate-500 uppercase tracking-widest">
              <UserCircle size={18} className="text-indigo-400" />
              Identidad del Alumno
            </div>
            <div className="relative group/input">
               <input 
                 type="text" 
                 value={studentName}
                 onChange={(e) => setStudentName(e.target.value)}
                 placeholder="Tu nombre completo..."
                 className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-600"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-indigo-400 transition-colors">
                 <User size={16} />
               </div>
            </div>
          </div>

          {/* Selector de Tamaño de Fuente */}
          <div className="mb-8 px-2 border-t border-slate-800 pt-8">
            <div className="flex items-center gap-2 mb-4 text-xs font-black text-slate-500 uppercase tracking-widest">
              <TypeIcon size={18} className="text-indigo-400" />
              Preferencia de Lectura
            </div>
            <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-800/50 rounded-2xl">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    fontSize === size.value 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                  title={size.label}
                >
                  {size.label.charAt(0)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10 px-2 border-t border-slate-800 pt-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">EXPEDIENTE GLOBAL</span>
              <span className="text-sm font-black text-indigo-400">{progressPercent}%</span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${masterCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <nav className="space-y-2">
            {CURRICULUM.map((block) => {
              const isUnlocked = unlockedBlocks.includes(block.id);
              const isCompleted = completedBlocks.includes(block.id);
              const isActive = currentBlockId === block.id && !finalMasterExam;

              return (
                <div key={block.id} className="mb-6">
                  <button
                    disabled={!isUnlocked}
                    onClick={() => selectLesson(block.id, block.lessons[0].id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      isActive ? 'bg-indigo-900/40 text-indigo-300 shadow-sm border-2 border-indigo-900/50' : isUnlocked ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100' : 'text-slate-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0 text-left">
                      {isCompleted ? <CheckCircle size={20} className="text-emerald-500 shrink-0" /> : isUnlocked ? <div className={`shrink-0 w-3 h-3 rounded-full ${isActive ? 'bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'bg-slate-600'}`} /> : <Lock size={18} className="shrink-0" />}
                      <span className="text-sm font-black truncate">{block.id}. {block.title}</span>
                    </div>
                  </button>
                  {isActive && (
                    <div className="mt-3 ml-6 border-l-2 border-slate-800 pl-6 space-y-2">
                      {block.lessons.map(lesson => (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(block.id, lesson.id)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors ${currentLessonId === lesson.id ? 'bg-slate-800 text-slate-100 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {lesson.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-emerald-500" />
              Sincronizado
            </div>
            <div className="flex items-center gap-2">
               <span>{new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
               <button 
                 onClick={async () => {
                   if(confirm("¿Deseas resetear el expediente académico completo?")) {
                     await clearIDB();
                     window.location.reload();
                   }
                 }}
                 className="ml-3 p-1.5 hover:text-red-500 transition-colors"
                 title="Reiniciar Progreso"
               >
                 <RotateCcw size={14} />
               </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <main className="flex-1 overflow-y-auto relative bg-slate-950 flex flex-col pb-28 sm:pb-0">
        <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 shadow-sm transition-all duration-300">
          <header className="px-6 sm:px-12 h-20 sm:h-28 flex justify-between items-center">
            <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-3 -ml-2 hover:bg-slate-800 text-indigo-400 rounded-2xl transition-colors lg:hidden shrink-0 border border-transparent active:border-indigo-900" 
                aria-label="Abrir navegación lateral"
              >
                <Menu size={32} strokeWidth={2.5} />
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] sm:text-sm font-black text-indigo-500 uppercase tracking-[0.3em] truncate leading-none">
                  {finalMasterExam ? "Certificación de Élite" : currentBlock.title}
                </span>
                <h2 className="text-base sm:text-2xl font-black text-slate-100 truncate leading-none mt-2 sm:mt-3">
                  {finalMasterExam ? "MÁSTER IA" : examMode ? "Evaluación del Módulo" : currentLesson.title}
                </h2>
              </div>
            </div>
            
            {/* Identificador de Alumno en Header */}
            <div className="flex items-center gap-4 sm:gap-6 ml-6">
              <div className="hidden sm:flex flex-col items-end min-w-0">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">ESTUDIANTE</p>
                <p className="text-sm font-bold text-slate-300 mt-2 truncate max-w-[150px]">{studentName}</p>
              </div>
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-indigo-400 border-2 border-indigo-900/50 shadow-inner overflow-hidden shrink-0">
                <Brain size={28} />
              </div>
            </div>
          </header>

          {/* Barra de Capítulos Rápida (Escritorio) */}
          {!examMode && !masterCompleted && (
            <div className="hidden lg:flex px-12 py-3 items-center gap-3 border-t border-slate-800 bg-slate-900/30 overflow-x-auto scrollbar-hide">
              <div className="shrink-0 p-1.5 text-slate-600">
                <List size={20} />
              </div>
              <div className="flex gap-3">
                {currentBlock.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(currentBlockId, lesson.id)}
                    className={`px-5 py-2 rounded-full text-xs font-black transition-all border-2 ${
                      currentLessonId === lesson.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-400'
                    }`}
                  >
                    {idx + 1}. {lesson.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cuerpo del Contenido */}
        <div className="flex-1">
          <div className="max-w-5xl mx-auto px-6 sm:px-12 py-10 sm:py-20">
            {!examMode ? (
              masterCompleted ? (
                <div className="text-center space-y-10 sm:space-y-16 animate-in zoom-in duration-1000 max-w-3xl mx-auto py-16">
                   <div className="w-32 h-32 sm:w-48 sm:h-48 bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(245,158,11,0.2)] border-2 border-amber-900/50">
                     <Award size={64} className="sm:size-24" />
                   </div>
                   <div className="space-y-6">
                     <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">¡ENHORABUENA, MAGÍSTER!</h1>
                     <p className="text-slate-400 text-lg sm:text-2xl max-w-xl mx-auto leading-relaxed">
                       Tu excelencia técnica ha sido certificada. Has culminado el programa académico más exigente en Inteligencia Artificial.
                     </p>
                   </div>
                   
                   <div className="bg-slate-900 border-2 border-slate-800 p-10 sm:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                       <GraduationCap size={120} color="white" />
                     </div>
                     <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-4">Mención de Honor</p>
                     <p className="text-3xl sm:text-5xl font-black text-indigo-400 tracking-tight">{studentName}</p>
                     <div className="mt-10 pt-10 border-t border-slate-800 flex items-center justify-center gap-4 text-emerald-400 font-black text-sm uppercase tracking-[0.2em]">
                        <CheckCircle size={24} /> Verificación Gemini Académica Activa
                     </div>
                   </div>

                   <button onClick={downloadCertificate} className="w-full bg-indigo-600 text-white px-8 sm:px-12 py-6 rounded-[2.5rem] font-black shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center justify-center gap-4 transform hover:scale-[1.03] active:scale-95 transition-all text-xl">
                     <Download size={28} /> DESCARGAR TÍTULO PDF
                   </button>
                   
                   <button 
                     onClick={async () => {
                        if(confirm("¿Estás seguro de que quieres borrar tu expediente y comenzar de nuevo?")) {
                          await clearIDB();
                          window.location.reload();
                        }
                     }}
                     className="text-xs text-slate-500 hover:text-red-400 font-black uppercase tracking-[0.3em] mt-12 transition-colors flex items-center justify-center gap-3 mx-auto"
                   >
                     <RotateCcw size={16} /> Reiniciar Historial Académico
                   </button>
                </div>
              ) : (
                <div className="space-y-10 sm:space-y-12">
                  <div className="bg-slate-900/50 p-6 sm:p-16 rounded-[3rem] sm:rounded-[5rem] border-2 border-slate-800 shadow-2xl shadow-black/60 min-h-[500px]">
                    {lessonLoading ? (
                      <LoadingPlaceholder />
                    ) : (
                      <div 
                        className="prose prose-invert max-w-none animate-in fade-in slide-in-from-bottom-6 duration-1000"
                        style={{ fontSize: fontSize }}
                      >
                        <div className="flex items-center gap-4 mb-10 sm:mb-16 pb-6 sm:pb-8 border-b-2 border-slate-800">
                          <div className="p-2.5 sm:p-4 bg-indigo-950/30 rounded-2xl text-indigo-400 shrink-0 border-2 border-indigo-900/50">
                            <BookOpen size={28} className="sm:size-10" />
                          </div>
                          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-slate-500">Manual Técnico de Nivel Doctorado</span>
                        </div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                          {lessonCache[currentLessonId] || ""}
                        </ReactMarkdown>

                        {!lessonLoading && (
                          <div className="hidden sm:flex justify-between items-center py-12 mt-20 border-t-2 border-slate-800 gap-6">
                            <button 
                              onClick={goToPrevLesson} 
                              disabled={isFirstLessonOfBlock}
                              className="flex items-center gap-3 px-8 py-5 rounded-[2rem] border-2 border-slate-700 text-slate-400 font-black hover:bg-slate-800 hover:text-slate-100 transition-all disabled:opacity-20 disabled:cursor-not-allowed text-base uppercase tracking-widest group"
                            >
                              <ChevronLeft size={24} className="group-hover:-translate-x-2 transition-transform" />
                              Anterior
                            </button>
                            <button 
                              onClick={isLastLessonOfBlock ? () => handleStartExam(false) : goToNextLesson} 
                              disabled={lessonLoading} 
                              className="flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-500/20 transition-all transform hover:scale-[1.03] active:scale-95 text-lg uppercase tracking-widest group"
                            >
                              {isLastLessonOfBlock ? "Comenzar Examen de Bloque" : "Siguiente Lección"} 
                              <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="animate-in zoom-in duration-500">
                {examLoading ? (
                  <LoadingPlaceholder />
                ) : (
                  <div className="space-y-12">
                    {examResult ? (
                      <div className="text-center p-12 sm:p-20 bg-slate-900 border-2 border-slate-800 rounded-[4rem] shadow-2xl shadow-black/60">
                        <div className={`w-28 h-28 sm:w-40 sm:h-40 mx-auto flex items-center justify-center rounded-full mb-10 ${examResult.passed ? 'bg-emerald-950/40 text-emerald-400 border-2 border-emerald-900 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'bg-red-950/40 text-red-400 border-2 border-red-900 shadow-[0_0_40px_rgba(239,68,68,0.2)]'}`}>
                          {examResult.passed ? <Trophy size={64} /> : <AlertCircle size={64} />}
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                          {examResult.passed ? "Módulo Superado" : "Evaluación Fallida"}
                        </h2>
                        <p className="text-slate-400 mb-12 text-xl font-bold italic">Rendimiento Académico: <span className="font-black text-white not-italic text-2xl ml-2">{examResult.score} / {examQuestions.length}</span></p>
                        
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                          <button 
                            onClick={closeExam}
                            className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 transition-all text-lg uppercase tracking-widest transform active:scale-95"
                          >
                            {examResult.passed ? "Continuar Máster" : "Volver al Temario"}
                          </button>
                          {!examResult.passed && (
                            <button 
                              onClick={() => handleStartExam(finalMasterExam)}
                              className="bg-slate-800 text-white px-10 py-5 rounded-[2rem] font-black shadow-xl hover:bg-slate-700 transition-all border-2 border-slate-700 text-lg uppercase tracking-widest transform active:scale-95"
                            >
                              Reintentar Examen
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-10 pb-40">
                        <div className="bg-indigo-600 text-white p-8 sm:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.4)] flex items-center justify-between sticky top-24 z-20">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-2">Evaluación en Curso</p>
                            <h3 className="text-lg sm:text-3xl font-black">Justifica tu conocimiento</h3>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-black opacity-60 uppercase tracking-widest">PROGRESO</p>
                             <p className="text-2xl sm:text-4xl font-black">{Object.keys(examAnswers).length} / {examQuestions.length}</p>
                          </div>
                        </div>

                        {examQuestions.map((q, qIdx) => {
                          const isAnswered = examAnswers[qIdx] !== undefined;
                          const selectedOption = examAnswers[qIdx];

                          return (
                            <div key={qIdx} className="bg-slate-900 p-8 sm:p-16 rounded-[4rem] border-2 border-slate-800 shadow-2xl animate-in slide-in-from-bottom-8" style={{ animationDelay: `${qIdx * 80}ms` }}>
                              <div className="flex justify-between items-start mb-8">
                                <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em]">Cuestión Técnica {qIdx + 1}</p>
                                {isAnswered && (
                                  <div className={`flex items-center gap-3 text-xs font-black uppercase tracking-widest ${selectedOption === q.correctIndex ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {selectedOption === q.correctIndex ? (
                                      <><CheckCircle size={20} /> Correcto</>
                                    ) : (
                                      <><AlertCircle size={20} /> Incorrecto</>
                                    )}
                                  </div>
                                )}
                              </div>
                              <h4 className="text-xl sm:text-3xl font-bold text-slate-100 mb-10 leading-tight tracking-tight">{q.question}</h4>
                              <div className="grid gap-4 sm:grid-cols-2">
                                {q.options.map((opt, oIdx) => {
                                  let buttonStyle = 'border-slate-800 bg-slate-800/30 text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-200';
                                  let iconStyle = 'bg-slate-700 text-slate-500';

                                  if (isAnswered) {
                                    if (oIdx === q.correctIndex) {
                                      buttonStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]';
                                      iconStyle = 'bg-emerald-500 text-white';
                                    } else if (oIdx === selectedOption) {
                                      buttonStyle = 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]';
                                      iconStyle = 'bg-red-500 text-white';
                                    } else {
                                      buttonStyle = 'border-slate-800 bg-slate-800/10 text-slate-600 opacity-40';
                                      iconStyle = 'bg-slate-800 text-slate-700';
                                    }
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      disabled={isAnswered}
                                      onClick={() => setExamAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                      className={`text-left p-6 sm:p-8 rounded-[2rem] border-2 transition-all text-sm sm:text-lg font-bold ${buttonStyle}`}
                                    >
                                      <div className="flex gap-4">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${iconStyle}`}>
                                          {String.fromCharCode(65 + oIdx)}
                                        </span>
                                        {opt}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        <div className="fixed bottom-28 lg:bottom-12 left-1/2 transform -translate-x-1/2 w-[calc(100%-3rem)] max-w-5xl bg-slate-900/98 backdrop-blur-2xl p-8 rounded-[3rem] border-2 border-slate-800 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-center justify-between gap-6 z-40">
                           <div className="hidden sm:block">
                             <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Resumen de Respuestas</p>
                             <p className="text-lg font-black text-slate-200">{Object.keys(examAnswers).length} de {examQuestions.length} completadas</p>
                           </div>
                           <div className="flex gap-4 w-full sm:w-auto">
                              <button 
                                onClick={closeExam}
                                className="px-8 py-5 rounded-2xl font-black text-slate-500 hover:text-red-400 transition-colors text-xs uppercase tracking-widest"
                              >
                                Abandonar
                              </button>
                              <button 
                                disabled={Object.keys(examAnswers).length < examQuestions.length}
                                onClick={handleSubmitExam}
                                className="flex-1 sm:flex-none bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:grayscale transform active:scale-95 text-base sm:text-xl uppercase tracking-widest"
                              >
                                FINALIZAR Y CALIFICAR
                              </button>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {!examMode && !masterCompleted && (
          <div className="fixed bottom-0 left-0 right-0 h-24 bg-slate-900/98 backdrop-blur-2xl border-t-2 border-slate-800 px-6 flex items-center justify-between gap-4 z-40 lg:hidden shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
            <button 
              onClick={goToPrevLesson} 
              disabled={isFirstLessonOfBlock || lessonLoading} 
              className="w-16 h-14 flex items-center justify-center rounded-2xl border-2 border-slate-700 text-slate-400 bg-slate-800 active:bg-slate-700 transition-colors disabled:opacity-10"
              aria-label="Lección anterior"
            >
              <ChevronLeft size={28} />
            </button>
            <button 
              onClick={isLastLessonOfBlock ? () => handleStartExam(false) : goToNextLesson} 
              disabled={lessonLoading} 
              className="flex-1 bg-indigo-600 text-white h-14 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 active:bg-indigo-700 transition-colors uppercase tracking-[0.2em]"
            >
              {isLastLessonOfBlock ? "Examen de Bloque" : "Siguiente"} <ChevronRight size={24} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
