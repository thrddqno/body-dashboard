export interface WeeklyAiAnalysis {
  summary: string;
  knownFacts: string[];
  interpretation: string[];
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  dataGaps: string[];
  generatedAt: string;
}
