import React, { useState, useEffect } from "react";
import { ProcessingStates } from "../../data/constants";

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
              className={`h-2 rounded-full transition-all duration-700 ${
                i === index ? "w-12 bg-indigo-500" : "w-2 bg-slate-800"
              }`}
            />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Gemini 2.0 Flash Academic Engine
        </p>
      </div>

      <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 animate-progress"></div>
      </div>
    </div>
  );
};

export default LoadingPlaceholder;
