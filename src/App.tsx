import React, { useState, useEffect, useMemo } from "react";
import { Menu, X, Clock, Type as TypeIcon } from "lucide-react";
import { CURRICULUM, FONT_SIZES } from "./data/constants";
import { getFromIDB, saveToIDB } from "./services/db";
import {
  generateExam,
  generateLessonContent,
  expandSectionContent,
} from "./services/ai";
import { downloadCertificate } from "./services/certificate";
import Sidebar from "./components/layout/Sidebar";
import LessonView from "./components/lesson/LessonView";
import ExamView from "./components/exam/ExamView";
import { Question } from "./types";

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
  const [expandedCache, setExpandedCache] = useState<
    Record<string, Record<string, string>>
  >({});

  // Estados de carga
  const [lessonLoading, setLessonLoading] = useState(false);
  const [expandingSections, setExpandingSections] = useState<
    Record<string, boolean>
  >({});

  // Estados de Examen
  const [examMode, setExamMode] = useState(false);
  const [finalMasterExam, setFinalMasterExam] = useState(false);
  const [examLoading, setExamLoading] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examResult, setExamResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);

  // Estados de UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showResumedNotice, setShowResumedNotice] = useState(false);

  // Carga inicial desde IndexedDB
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved: any = await getFromIDB("current");
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
      savedAt: Date.now(),
    };

    saveToIDB("current", stateToSave);
  }, [
    isHydrated,
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
  ]);

  const currentBlock = useMemo(
    () => CURRICULUM.find((b) => b.id === currentBlockId)!,
    [currentBlockId]
  );
  const currentLesson = useMemo(
    () => currentBlock.lessons.find((l) => l.id === currentLessonId)!,
    [currentBlock, currentLessonId]
  );

  const totalLessons = CURRICULUM.reduce((acc, b) => acc + b.lessons.length, 0);
  const progressPercent = Math.round(
    ((completedBlocks.length * 4 + (masterCompleted ? 4 : 0)) /
      (totalLessons + 4)) *
      100
  );

  useEffect(() => {
    if (showResumedNotice) {
      const timer = setTimeout(() => setShowResumedNotice(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showResumedNotice]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isSidebarOpen]);

  const selectLesson = (blockId: number, lessonId: string) => {
    setCurrentBlockId(blockId);
    setCurrentLessonId(lessonId);
    setExamMode(false);
    setFinalMasterExam(false);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (
      isHydrated &&
      !lessonCache[currentLessonId] &&
      !examMode &&
      !finalMasterExam
    ) {
      loadLesson();
    }
  }, [isHydrated, currentLessonId, examMode, finalMasterExam]);

  const loadLesson = async () => {
    setLessonLoading(true);
    try {
      const content = await generateLessonContent(
        currentLesson.title,
        currentLesson.topic
      );
      setLessonCache((prev) => ({ ...prev, [currentLessonId]: content }));
    } catch (err) {
      console.error(err);
    } finally {
      setLessonLoading(false);
    }
  };

  const handleExpand = async (sectionTitle: string) => {
    if (expandingSections[sectionTitle]) return;

    setExpandingSections((prev) => ({ ...prev, [sectionTitle]: true }));
    try {
      const expandedText = await expandSectionContent(
        currentLesson.title,
        sectionTitle
      );
      setExpandedCache((prev) => ({
        ...prev,
        [currentLessonId]: {
          ...(prev[currentLessonId] || {}),
          [sectionTitle]: expandedText,
        },
      }));
    } catch (err) {
      alert("Error al ampliar la sección.");
    } finally {
      setExpandingSections((prev) => ({ ...prev, [sectionTitle]: false }));
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      let title = isFinal ? "EXAMEN FINAL DE MÁSTER" : currentBlock.title;
      let lessonTexts: string[] = [];

      if (isFinal) {
        CURRICULUM.forEach((b) => {
          b.lessons.forEach((l) => {
            if (lessonCache[l.id]) {
              lessonTexts.push(
                `--- LECCIÓN: ${l.title} ---\n${lessonCache[l.id]}`
              );
              if (expandedCache[l.id]) {
                Object.entries(expandedCache[l.id]).forEach(
                  ([section, expanded]) => {
                    lessonTexts.push(
                      `--- AMPLIACIÓN: ${section} ---\n${expanded}`
                    );
                  }
                );
              }
            }
          });
        });
      } else {
        currentBlock.lessons.forEach((l) => {
          if (lessonCache[l.id]) {
            lessonTexts.push(
              `--- LECCIÓN: ${l.title} ---\n${lessonCache[l.id]}`
            );
            if (expandedCache[l.id]) {
              Object.entries(expandedCache[l.id]).forEach(
                ([section, expanded]) => {
                  lessonTexts.push(
                    `--- AMPLIACIÓN: ${section} ---\n${expanded}`
                  );
                }
              );
            }
          }
        });
      }

      if (lessonTexts.length === 0) {
        lessonTexts = currentBlock.lessons.map((l) => l.title);
      }

      const questions = await generateExam(
        title,
        lessonTexts,
        isFinal ? 10 : 30
      );
      setExamQuestions(questions);
    } catch (err) {
      console.error(err);
      alert(
        "Error al cargar el examen. Por favor, asegúrate de haber visualizado las lecciones del bloque."
      );
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
        setCompletedBlocks((prev) =>
          Array.from(new Set([...prev, currentBlockId]))
        );
        const nextBlockId = currentBlockId + 1;
        if (nextBlockId <= CURRICULUM.length) {
          setUnlockedBlocks((prev) =>
            Array.from(new Set([...prev, nextBlockId]))
          );
        }
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeExam = () => {
    setExamMode(false);
    setFinalMasterExam(false);
    setExamResult(null);
    setExamAnswers({});
    setExamQuestions([]);
  };

  const goToNextLesson = () => {
    const currentIndex = currentBlock.lessons.findIndex(
      (l) => l.id === currentLessonId
    );
    if (currentIndex < currentBlock.lessons.length - 1) {
      selectLesson(currentBlockId, currentBlock.lessons[currentIndex + 1].id);
    }
  };

  const goToPrevLesson = () => {
    const currentIndex = currentBlock.lessons.findIndex(
      (l) => l.id === currentLessonId
    );
    if (currentIndex > 0) {
      selectLesson(currentBlockId, currentBlock.lessons[currentIndex - 1].id);
    }
  };

  const isLastLessonOfBlock =
    currentBlock.lessons.findIndex((l) => l.id === currentLessonId) ===
    currentBlock.lessons.length - 1;
  const isFirstLessonOfBlock =
    currentBlock.lessons.findIndex((l) => l.id === currentLessonId) === 0;

  if (!isHydrated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-6">
          <div className="p-6 bg-indigo-600 rounded-3xl text-white inline-block animate-bounce shadow-2xl shadow-indigo-500/20">
            <X size={56} />
          </div>
          <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">
            Inicializando Entorno Élite...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative text-slate-100 font-sans">
      <Sidebar
        unlockedBlocks={unlockedBlocks}
        completedBlocks={completedBlocks}
        currentBlockId={currentBlockId}
        currentLessonId={currentLessonId}
        masterCompleted={masterCompleted}
        studentName={studentName}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        selectLesson={selectLesson}
        handleStartExam={handleStartExam}
        setStudentName={setStudentName}
      />

      {/* Área Principal */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Header Desktop */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 bg-slate-900 border border-slate-800 rounded-2xl lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-4 bg-slate-900/50 px-5 py-2.5 rounded-2xl border border-slate-800 shadow-inner">
              <div className="w-10 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {progressPercent}% completado
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner overflow-hidden">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    fontSize === size.value
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <TypeIcon size={14} className="inline mr-1" />
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Notificación de Progreso Recuperado */}
        {showResumedNotice && (
          <div className="fixed top-28 left-1/2 transform -translate-x-1/2 z-[60] animate-in slide-in-from-top duration-700 w-[calc(100%-3rem)] max-w-md">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 backdrop-blur-md">
              <Clock size={20} className="text-indigo-400 shrink-0" />
              <span className="text-sm font-bold">
                Base de datos local sincronizada con éxito
              </span>
              <button
                onClick={() => setShowResumedNotice(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl ml-auto"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Contenido Dinámico */}
        {examMode ? (
          <ExamView
            loading={examLoading}
            questions={examQuestions}
            answers={examAnswers}
            result={examResult}
            finalMasterExam={finalMasterExam}
            blockTitle={finalMasterExam ? "EXAMEN FINAL" : currentBlock.title}
            studentName={studentName}
            setAnswers={setExamAnswers}
            submitExam={handleSubmitExam}
            closeExam={closeExam}
            downloadCertificate={() => downloadCertificate(studentName)}
          />
        ) : (
          <LessonView
            lesson={currentLesson}
            content={lessonCache[currentLessonId] || ""}
            loading={lessonLoading}
            fontSize={fontSize}
            expandedCache={expandedCache[currentLessonId] || {}}
            expandingSections={expandingSections}
            handleExpand={handleExpand}
            goToPrevLesson={goToPrevLesson}
            goToNextLesson={goToNextLesson}
            isFirst={isFirstLessonOfBlock && currentBlockId === 1}
            isLast={isLastLessonOfBlock && currentBlockId === CURRICULUM.length}
          />
        )}
      </main>
    </div>
  );
};

export default App;
