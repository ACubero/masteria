import React from "react";
import {
  GraduationCap,
  X,
  BookOpen,
  Lock,
  CheckCircle,
  Trophy,
  Award,
  User,
  RotateCcw,
} from "lucide-react";
import { CURRICULUM } from "../../data/constants";

interface SidebarProps {
  unlockedBlocks: number[];
  completedBlocks: number[];
  currentBlockId: number;
  currentLessonId: string;
  masterCompleted: boolean;
  studentName: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  selectLesson: (blockId: number, lessonId: string) => void;
  handleStartExam: (isFinal?: boolean) => void;
  setStudentName: (name: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  unlockedBlocks,
  completedBlocks,
  currentBlockId,
  currentLessonId,
  masterCompleted,
  studentName,
  isSidebarOpen,
  setIsSidebarOpen,
  selectLesson,
  handleStartExam,
  setStudentName,
}) => {
  return (
    <>
      {/* Sidebar Backdrop para Móvil */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-40 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Navegación Lateral (Sidebar) */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-[300px] sm:w-[350px] bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out transform 
        lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
       flex flex-col glass`}
      >
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="font-black text-slate-100 tracking-tight leading-none text-base">
                MÁSTER IA
              </h1>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Portal Académico
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-300 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Perfil del Estudiante */}
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <User size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-100 w-full"
                  placeholder="Tu nombre completo"
                />
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  Candidato al Título
                </p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-1000"
                style={{
                  width: `${
                    (completedBlocks.length / CURRICULUM.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <nav className="space-y-6">
            {CURRICULUM.map((block) => {
              const isUnlocked = unlockedBlocks.includes(block.id);
              const isCompleted = completedBlocks.includes(block.id);

              return (
                <div key={block.id} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h3
                      className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                        isUnlocked ? "text-indigo-400" : "text-slate-600"
                      }`}
                    >
                      Módulo {block.id.toString().padStart(2, "0")}
                    </h3>
                    {isCompleted && (
                      <CheckCircle size={14} className="text-emerald-400" />
                    )}
                    {!isUnlocked && (
                      <Lock size={14} className="text-slate-700" />
                    )}
                  </div>

                  <div className="space-y-1">
                    {block.lessons.map((lesson) => {
                      const isActive = currentLessonId === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          disabled={!isUnlocked}
                          onClick={() => selectLesson(block.id, lesson.id)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group
                            ${
                              isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                : isUnlocked
                                ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                                : "text-slate-700 cursor-not-allowed"
                            }
                          `}
                        >
                          <BookOpen
                            size={18}
                            className={
                              isActive
                                ? "text-white"
                                : isUnlocked
                                ? "text-slate-500 group-hover:text-indigo-400"
                                : "text-slate-800"
                            }
                          />
                          <span
                            className={`text-xs font-bold truncate ${
                              isActive ? "text-white" : ""
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </button>
                      );
                    })}

                    {isUnlocked && (
                      <button
                        onClick={() => {
                          selectLesson(block.id, block.lessons[0].id); // Just to set block
                          handleStartExam();
                        }}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-indigo-900/30 mt-2
                          ${
                            completedBlocks.includes(block.id)
                              ? "bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40 border-emerald-900/30"
                              : "bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/40"
                          }
                        `}
                      >
                        <Trophy size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {completedBlocks.includes(block.id)
                            ? "Examen Superado"
                            : "Realizar Examen"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar: Examen Final */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <button
            disabled={completedBlocks.length < CURRICULUM.length}
            onClick={() => handleStartExam(true)}
            className={`
              w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest
              ${
                completedBlocks.length === CURRICULUM.length
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-600/20"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              }
            `}
          >
            {masterCompleted ? <Award size={20} /> : <Trophy size={20} />}
            {masterCompleted ? "Máster Completado" : "Examen Final"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
