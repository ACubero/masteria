export interface Lesson {
  id: string;
  title: string;
  topic: string;
}

export interface Block {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ExamResult {
  score: number;
  passed: boolean;
}

export interface ProcessingState {
  icon: JSX.Element;
  text: string;
}
