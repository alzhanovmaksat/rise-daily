// Enhanced affirmations helper with category support
// Categories: faith, confidence, gratitude, peace, strength, hope

// Category definitions with display info
export const CATEGORIES = {
  all: { label: 'All', icon: 'apps', color: '#4A90E2' },
  faith: { label: 'Faith', icon: 'book', color: '#6A11CB' },
  confidence: { label: 'Confidence', icon: 'flash', color: '#FF6B6B' },
  gratitude: { label: 'Gratitude', icon: 'heart', color: '#4ECDC4' },
  peace: { label: 'Peace', icon: 'leaf', color: '#2ECC71' },
  strength: { label: 'Strength', icon: 'fitness', color: '#E74C3C' },
  hope: { label: 'Hope', icon: 'sunny', color: '#F39C12' }
};

// Helper to categorize existing affirmations based on content
export function categorizeAffirmation(affirmation) {
  const text = affirmation.text.toLowerCase();
  const source = affirmation.source.toLowerCase();
  
  // Keywords for each category
  const categoryKeywords = {
    faith: ['lord', 'god', 'christ', 'jesus', 'faith', 'believe', 'trust', 'prayer', 'spirit', 'heaven', 'blessed', 'holy', 'psalm', 'proverb'],
    confidence: ['confident', 'courage', 'fear not', 'brave', 'strong', 'capable', 'achieve', 'success', 'great work', 'determination', 'powerful'],
    gratitude: ['thank', 'grateful', 'blessed', 'appreciate', 'gift', 'treasure', 'fortune', 'abundance'],
    peace: ['peace', 'calm', 'rest', 'still', 'quiet', 'comfort', 'gentle', 'ease', 'relax', 'serene', 'tranquil'],
    strength: ['strength', 'strong', 'endure', 'persevere', 'overcome', 'warrior', 'mighty', 'power', 'fight', 'battle', 'victory'],
    hope: ['hope', 'future', 'tomorrow', 'new', 'beginning', 'dawn', 'light', 'promise', 'dream', 'possibility', 'better']
  };
  
  // Check for category matches
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword) || source.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Default based on type
  return affirmation.type === 'bible' ? 'faith' : 'confidence';
}

// Enhance affirmation object with category
export function enhanceAffirmation(affirmation) {
  return {
    ...affirmation,
    category: categorizeAffirmation(affirmation)
  };
}

// Get current time of day
export function getCurrentTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

// Filter affirmations by category
export function filterByCategory(affirmationsList, category) {
  if (category === 'all') return affirmationsList;
  return affirmationsList.filter(a => {
    const enhanced = enhanceAffirmation(a);
    return enhanced.category === category;
  });
}

// Get random affirmation with category filter and history awareness
export function getRandomAffirmationFiltered(affirmationsList, category = 'all', history = []) {
  // First filter by category
  let filtered = filterByCategory(affirmationsList, category);
  
  // Then try to avoid recently shown
  const notInHistory = filtered.filter(a => !history.includes(a.id));
  
  // If we've shown all, reset and use full filtered list
  const pool = notInHistory.length > 0 ? notInHistory : filtered;
  
  if (pool.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return enhanceAffirmation(pool[randomIndex]);
}

// Get all favorites with full data
export function getFavoriteAffirmations(allAffirmations, favoriteIds) {
  const all = [
    ...allAffirmations.morning,
    ...allAffirmations.afternoon,
    ...allAffirmations.evening
  ];
  
  return favoriteIds
    .map(id => all.find(a => a.id === id))
    .filter(Boolean)
    .map(enhanceAffirmation);
}

// Get category stats
export function getCategoryStats(affirmationsList) {
  const stats = {};
  
  for (const category of Object.keys(CATEGORIES)) {
    if (category === 'all') {
      stats[category] = affirmationsList.length;
    } else {
      stats[category] = filterByCategory(affirmationsList, category).length;
    }
  }
  
  return stats;
}
