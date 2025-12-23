// Profanity filter for chat messages
const BANNED_WORDS = [
  // Racial slurs
  'n-word', 'nword', 'n word',
  // Generic profanity
  'badword', 'damn', 'crap', 'bullshit', 'shit', 'piss', 'asshole', 'bitch', 'bastard', 'fuck', 'fuckhead', 'motherfucker',
];

function escapeCensoredWord(word: string): string {
  return '[CENSORED]';
}

export function censorProfanity(text: string): string {
  if (!text) return text;
  
  let censored = text;
  
  // Create case-insensitive regex patterns for each banned word
  for (const bannedWord of BANNED_WORDS) {
    // Match word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${bannedWord}\\b`, 'gi');
    censored = censored.replace(regex, escapeCensoredWord(bannedWord));
  }
  
  return censored;
}
