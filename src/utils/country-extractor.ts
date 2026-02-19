import { getCountryCode } from '../countries.js';

/**
 * Extracts destination country from input text
 */
export function extractDestinationCountry(input: string): string | null {
  // First, check phrases like "in [location]", "to [location]", "at [location]"
  // This is more reliable than scanning all words
  const locationPatterns = [
    /\b(?:in|to|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
  ];

  for (const pattern of locationPatterns) {
    const matches = input.matchAll(pattern);
    for (const match of matches) {
      const location = match[1]?.toLowerCase();
      if (location) {
        const countryCode = getCountryCode(location);
        if (countryCode) {
          return countryCode;
        }
      }
    }
  }

  // Then check for country mentions as whole words (not partial matches)
  const words = input.toLowerCase().split(/\b/); // Split on word boundaries
  const skipWords = ['send', 'for', 'the', 'a', 'an', 'to', 'in', 'at', 'from', 'my', 'his', 'her', 'their'];

  // Check single words and multi-word combinations
  for (let i = 0; i < words.length; i++) {
    const word = words[i]?.trim();
    if (!word || word.length < 2) continue;

    // Skip common words that might cause false matches
    if (skipWords.includes(word)) {
      continue;
    }

    // Single word - must be exact match or known country code
    const countryCode = getCountryCode(word);
    if (countryCode && word.length >= 2) {
      // Verify it's not a partial match by checking word boundaries
      const wordIndex = input.toLowerCase().indexOf(word);
      if (wordIndex >= 0) {
        const beforeChar = wordIndex > 0 ? input[wordIndex - 1] : ' ';
        const afterIndex = wordIndex + word.length;
        const afterChar = afterIndex < input.length ? input[afterIndex] : ' ';
        // Only accept if surrounded by word boundaries
        if (beforeChar && afterChar && !/\w/.test(beforeChar) && !/\w/.test(afterChar)) {
          return countryCode;
        }
      }
    }

    // Two-word combinations (e.g., "south korea")
    if (i < words.length - 1 && word) {
      const nextWord = words[i + 1]?.trim();
      if (nextWord) {
        const twoWord = `${word} ${nextWord}`;
        const countryCode2 = getCountryCode(twoWord);
        if (countryCode2) {
          return countryCode2;
        }
      }
    }

    // Three-word combinations (e.g., "united arab emirates")
    if (i < words.length - 2) {
      const nextWord = words[i + 1]?.trim();
      const nextNextWord = words[i + 2]?.trim();
      if (nextWord && nextNextWord && word) {
        const threeWord = `${word} ${nextWord} ${nextNextWord}`;
        const countryCode3 = getCountryCode(threeWord);
        if (countryCode3) {
          return countryCode3;
        }
      }
    }
  }

  return null;
}
