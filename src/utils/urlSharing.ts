import LZString from 'lz-string';
import { QuizData } from '../types';
import { PRESET_QUIZZES } from './sampleData';

export function encodeQuizToUrl(quiz: QuizData, mode: 'play' | 'edit' = 'play'): string {
  try {
    const jsonStr = JSON.stringify(quiz);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#${mode}=${compressed}`;
  } catch (err) {
    console.error('Failed to encode quiz to URL', err);
    return window.location.href;
  }
}

export function decodeQuizFromUrl(): { quiz: QuizData; mode: 'play' | 'edit' } | null {
  try {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;

    let mode: 'play' | 'edit' = 'play';
    let compressedPayload = '';

    if (hash.startsWith('play=')) {
      mode = 'play';
      compressedPayload = hash.replace('play=', '');
    } else if (hash.startsWith('edit=')) {
      mode = 'edit';
      compressedPayload = hash.replace('edit=', '');
    } else if (hash.startsWith('preset=') || hash.startsWith('quiz=')) {
      const targetId = hash.replace(/^(?:preset|quiz)=/, '').toLowerCase().trim();
      const match = PRESET_QUIZZES.find(
        (p) => p.id.toLowerCase() === targetId || p.id.toLowerCase().includes(targetId)
      );
      if (match) {
        return { quiz: match, mode: 'play' };
      }
      return null;
    } else if (hash.startsWith('pin=') || hash.startsWith('p=')) {
      const pin = hash.replace(/^p(?:in)?=/, '').trim().toUpperCase();
      const raw = localStorage.getItem(`gmsm_pin_${pin}`);
      if (raw) {
        const parsed = JSON.parse(raw) as QuizData;
        return { quiz: parsed, mode: 'play' };
      }
      // Check presets by pin or prefix
      const match = PRESET_QUIZZES.find((p) => {
        const prefix = p.id.slice(0, 3).toUpperCase();
        return pin.includes(prefix) || p.id.toUpperCase().includes(pin);
      });
      if (match) {
        return { quiz: match, mode: 'play' };
      }
      return null;
    } else {
      return null;
    }

    if (!compressedPayload) return null;

    const decompressed = LZString.decompressFromEncodedURIComponent(compressedPayload);
    if (!decompressed) return null;

    const parsed = JSON.parse(decompressed) as QuizData;
    if (parsed && parsed.questions && parsed.matrix) {
      return { quiz: parsed, mode };
    }
  } catch (err) {
    console.error('Failed to decode quiz from URL', err);
  }
  return null;
}
