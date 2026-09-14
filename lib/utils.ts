import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  return {
    easy:   'text-primary-600 bg-primary-50',
    medium: 'text-accent-600 bg-accent-50',
    hard:   'text-red-600 bg-red-50',
  }[difficulty];
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-primary-600';
  if (score >= 60) return 'text-accent-600';
  return 'text-red-600';
}
