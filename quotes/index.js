import { happyQuotes } from './happy.js';
import { sadQuotes } from './sad.js';
import { angryQuotes } from './angry.js';
import { tiredQuotes } from './tired.js';
import { excitedQuotes } from './excited.js';

export const moodQuotes = {
    happy: happyQuotes,
    sad: sadQuotes,
    angry: angryQuotes,
    tired: tiredQuotes,
    excited: excitedQuotes
};

export function getRandomQuote(mood) {
    const quotes = moodQuotes[mood];
    return quotes[Math.floor(Math.random() * quotes.length)];
}