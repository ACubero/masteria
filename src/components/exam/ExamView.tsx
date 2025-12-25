import React from "react";
import {
  Loader2,
  Trophy,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Download,
  X,
  GraduationCap,
} from "lucide-react";
import { Question } from "../../types";

interface ExamViewProps {
  loading: boolean;
  questions: Question[];
  answers: Record<number, number>;
  result: { score: number; passed: boolean } | null;
  finalMasterExam: boolean;
  blockTitle: string;
  studentName: string;
  setAnswers: (answers: Record<number, number>) => void;
  submitExam: () => void;
  closeExam: () => void;
  downloadCertificate: () => void;
}

const ExamView: React.FC<ExamViewProps> = ({
  loading,
  questions,
  answers,
  result,
  finalMasterExam,
  blockTitle,
  studentName,
  setAnswers,
  submitExam,
  closeExam,
  downloadCertificate,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 sm:py-60 space-y-12 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse"></div>
          <div className="relative bg-slate-900 p-10 rounded-[3rem] border border-amber-900 shadow-2xl">
            <Trophy size={64} className="text-amber-500 animate-bounce-slow" />
          </div>
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-slate-100 tracking-tight">
            Evaluando Competencias...
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Sintetizando preguntas de nivel académico superior
          </p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-6 sm:px-12 animate-in zoom-in duration-500">
        <div
          className={`p-12 sm:p-20 rounded-[4rem] text-center space-y-10 shadow-2xl border-2 ${
            result.passed
              ? "bg-emerald-950/20 border-emerald-500/30"
              : "bg-red-950/20 border-red-500/30"
          }`}
        >
          <div className="flex justify-center">
            <div
              className={`p-10 rounded-[3rem] ${
                result.passed
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-red-500 text-white shadow-red-500/20"
              } shadow-2xl`}
            >
              {result.passed ? (
                <CheckCircle size={80} />
              ) : (
                <AlertCircle size={80} />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tighter">
              {result.passed ? "¡ÉXITO ACADÉMICO!" : "REVISIÓN NECESARIA"}
            </h2>
            <p className="text-slate-400 text-lg font-medium">
              Has obtenido una calificación de{" "}
              <span className="font-black text-white px-3 py-1 bg-slate-800 rounded-lg">
                {result.score}/{questions.length}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {!result.passed && (
              <button
                onClick={closeExam}
                className="flex items-center justify-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 transition-transform"
              >
                <RotateCcw size={20} />
                Reintentar Módulo
              </button>
            )}
            {result.passed && finalMasterExam && (
              <button
                onClick={downloadCertificate}
                className="flex items-center justify-center gap-3 bg-amber-500 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-amber-600/20"
              >
                <Download size={20} />
                Descargar Título
              </button>
            )}
            {result.passed && !finalMasterExam && (
              <button
                onClick={closeExam}
                className="flex items-center justify-center gap-3 bg-emerald-500 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-emerald-600/20"
              >
                Continuar Máster
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 sm:px-12 animate-in fade-in duration-700">
      <div className="bg-slate-900/50 p-8 sm:p-12 rounded-[3.5rem] border border-slate-800 mb-12 flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 text-amber-500 mb-2">
            <GraduationCap size={24} />
            <span className="text-xs font-black uppercase tracking-[0.3em]">
              Examen de Certificación
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            {blockTitle}
          </h1>
          <p className="text-slate-500 font-bold text-sm">
            Candidato: {studentName}
          </p>
        </div>
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center min-w-[140px]">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
            Preguntas
          </p>
          <p className="text-3xl font-black text-white">{questions.length}</p>
        </div>
      </div>

      <div className="space-y-8 mb-20">
        {questions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="bg-slate-900/30 p-8 sm:p-12 rounded-[2.5rem] border border-slate-800 hover:border-indigo-900/50 transition-colors group"
          >
            <div className="flex gap-6 mb-8">
              <span className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-lg font-black text-indigo-400 border border-slate-700">
                {qIdx + 1}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 leading-tight pt-1">
                {q.question}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 ml-0 sm:ml-18">
              {q.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => setAnswers({ ...answers, [qIdx]: oIdx })}
                  className={`
                    flex items-center gap-5 p-6 rounded-2xl transition-all text-left group/opt
                    ${
                      answers[qIdx] === oIdx
                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 border-transparent"
                        : "bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                    }
                  `}
                >
                  <div
                    className={`
                    w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-colors
                    ${
                      answers[qIdx] === oIdx
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-950 text-slate-600 group-hover/opt:text-indigo-400"
                    }
                  `}
                  >
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <span className="font-bold text-base sm:text-lg flex-1">
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-6 z-30">
        <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-700 shadow-2xl flex items-center justify-between gap-6">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest pl-4">
            Faltan{" "}
            <span className="text-indigo-400">
              {questions.length - Object.keys(answers).length}
            </span>{" "}
            por responder
          </p>
          <button
            onClick={submitExam}
            disabled={Object.keys(answers).length < questions.length}
            className="bg-indigo-600 text-white px-10 py-4 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all"
          >
            Entregar Examen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamView;
