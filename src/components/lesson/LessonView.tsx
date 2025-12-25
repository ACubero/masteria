import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2,
  Maximize2,
  Sparkles,
  PlusCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
import LoadingPlaceholder from "../ui/LoadingPlaceholder";
import { Lesson } from "../../types";

interface LessonViewProps {
  lesson: Lesson;
  content: string;
  loading: boolean;
  fontSize: string;
  expandedCache: Record<string, string>;
  expandingSections: Record<string, boolean>;
  handleExpand: (sectionTitle: string) => void;
  goToPrevLesson: () => void;
  goToNextLesson: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  content,
  loading,
  fontSize,
  expandedCache,
  expandingSections,
  handleExpand,
  goToPrevLesson,
  goToNextLesson,
  isFirst,
  isLast,
}) => {
  if (loading) return <LoadingPlaceholder />;

  const MarkdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1
        className="text-3xl sm:text-5xl font-extrabold text-slate-100 mb-8 mt-16"
        {...props}
      />
    ),
    h2: ({ node, children, ...props }: any) => {
      const title = String(children);
      const isExpanding = expandingSections[title];
      const hasExpanded = expandedCache?.[title];

      return (
        <div className="group/section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 mt-12 border-b-2 border-slate-800 pb-3 gap-3">
            <h2
              className="text-2xl sm:text-4xl font-bold text-slate-100 m-0"
              {...props}
            >
              {children}
            </h2>
            {!hasExpanded && (
              <button
                onClick={() => handleExpand(title)}
                disabled={isExpanding}
                className={`flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all disabled:cursor-not-allowed w-fit ${
                  isExpanding
                    ? "bg-indigo-600 text-white animate-pulse shadow-lg"
                    : "bg-indigo-900/40 text-indigo-400 border border-indigo-800 hover:bg-indigo-900/60"
                }`}
              >
                {isExpanding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Maximize2 size={16} />
                )}
                {isExpanding ? "Analizando..." : "Profundizar"}
              </button>
            )}
          </div>
          {hasExpanded && (
            <div className="bg-slate-800/40 border-l-[6px] border-indigo-500 p-6 sm:p-10 my-10 rounded-r-3xl animate-in slide-in-from-left duration-500">
              <div className="flex items-center gap-3 mb-6 text-indigo-400">
                <Sparkles size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Ampliación Académica Superior
                </span>
              </div>
              <div className="prose-base sm:prose-xl prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {hasExpanded}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      );
    },
    h3: ({ node, children, ...props }: any) => {
      const title = String(children);
      const isExpanding = expandingSections[title];
      const hasExpanded = expandedCache?.[title];

      return (
        <div className="group/section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 mt-10 gap-3">
            <h3
              className="text-xl sm:text-2xl font-bold text-slate-200 m-0"
              {...props}
            >
              {children}
            </h3>
            {!hasExpanded && (
              <button
                onClick={() => handleExpand(title)}
                disabled={isExpanding}
                className={`flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 w-fit ${
                  isExpanding
                    ? "bg-slate-700 text-white animate-pulse"
                    : "bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300 border border-slate-700"
                }`}
              >
                {isExpanding ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <PlusCircle size={12} />
                )}
                {isExpanding ? "Cargando..." : "Detalle"}
              </button>
            )}
          </div>
          {hasExpanded && (
            <div className="bg-indigo-950/20 border-l-4 border-indigo-700 p-6 my-6 rounded-r-2xl prose-base prose-invert animate-in slide-in-from-top duration-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {hasExpanded}
              </ReactMarkdown>
            </div>
          )}
        </div>
      );
    },
    blockquote: ({ node, ...props }: any) => (
      <div className="relative my-12 group/quote">
        <div className="absolute -left-6 top-0 bottom-0 w-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-900"></div>
        <blockquote
          className="bg-slate-800/60 p-8 sm:p-12 rounded-3xl sm:rounded-[3rem] border border-slate-800 backdrop-blur-sm"
          {...props}
        />
        <div className="absolute -top-4 -right-4 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform">
          <Info size={24} />
        </div>
      </div>
    ),
    p: ({ node, ...props }: any) => (
      <p
        className="text-slate-400 leading-relaxed mb-8 text-base sm:text-xl"
        {...props}
      />
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
      return !inline ? (
        <pre className="bg-black/40 text-slate-200 p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] overflow-x-auto my-10 text-sm sm:text-lg font-mono shadow-2xl border border-slate-800 relative group/code">
          <div className="absolute right-6 top-6 text-slate-600 text-[11px] font-black uppercase tracking-widest opacity-0 group-hover/code:opacity-100 transition-opacity">
            Kernel Snippet v3.0
          </div>
          <code {...props}>{children}</code>
        </pre>
      ) : (
        <code
          className="bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded-lg font-bold text-xs sm:text-base border border-indigo-800/30"
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <div
      className="max-w-4xl mx-auto py-12 px-6 sm:px-12 animate-in fade-in slide-in-from-bottom duration-700"
      style={{ fontSize }}
    >
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-indigo-900/30 text-indigo-400 rounded-2xl border border-indigo-800/50">
          <PlayCircle size={32} />
        </div>
        <div>
          <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">
            Lección Actual
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight">
            {lesson.title}
          </h1>
        </div>
      </div>

      <article className="prose prose-invert prose-slate max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={MarkdownComponents}
        >
          {content}
        </ReactMarkdown>
      </article>

      {/* Navegación entre lecciones */}
      <div className="mt-20 pt-12 border-t border-slate-800 flex flex-col sm:flex-row justify-between gap-6 pb-24">
        <button
          onClick={goToPrevLesson}
          disabled={isFirst}
          className={`
            flex items-center gap-4 px-8 py-5 rounded-3xl transition-all
            ${
              isFirst
                ? "opacity-0 pointer-events-none"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-indigo-900"
            }
          `}
        >
          <ChevronLeft size={24} />
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Anterior
            </p>
            <p className="font-bold text-sm">Lección Previa</p>
          </div>
        </button>

        <button
          onClick={goToNextLesson}
          disabled={isLast}
          className={`
            flex items-center gap-4 px-8 py-5 rounded-3xl transition-all
            ${
              isLast
                ? "opacity-30 cursor-not-allowed"
                : "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 hover:translate-x-1"
            }
          `}
        >
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
              Siguiente
            </p>
            <p className="font-bold text-sm">Continuar Máster</p>
          </div>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default LessonView;
