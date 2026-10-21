import LZString from 'lz-string';
import { QuizData } from '../types';

const PIN_STORAGE_PREFIX = 'gmsm_pin_';

/**
 * Generates or retrieves a clean 6-digit game PIN for quick room sharing
 */
export function generateGamePin(quiz: QuizData): string {
  // Create deterministic or random 6-character PIN
  const cleanId = (quiz.id || 'quiz').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const pin = `${cleanId || 'MTR'}-${randNum}`;

  try {
    localStorage.setItem(`${PIN_STORAGE_PREFIX}${pin}`, JSON.stringify(quiz));
  } catch (err) {
    console.error('Failed to store PIN quiz', err);
  }

  return pin;
}

export function getQuizByPin(pin: string): QuizData | null {
  try {
    const raw = localStorage.getItem(`${PIN_STORAGE_PREFIX}${pin.trim().toUpperCase()}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to get quiz by PIN', err);
  }
  return null;
}

/**
 * Attempts to shorten a URL using TinyURL public API with graceful fallback
 */
export async function createShortUrl(longUrl: string): Promise<string> {
  try {
    // Try TinyURL API
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
    if (response.ok) {
      const short = await response.text();
      if (short && short.startsWith('http')) {
        return short;
      }
    }
  } catch {
    // If CORS or offline, continue to fallback
  }

  try {
    // Try is.gd API
    const response = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`);
    if (response.ok) {
      const short = await response.text();
      if (short && short.startsWith('http')) {
        return short;
      }
    }
  } catch {
    // Fallback
  }

  // Fallback: return the original URL
  return longUrl;
}
