import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@favorites';
const NOTIFICATION_SETTINGS_KEY = '@notification_settings';
const STREAK_KEY = '@daily_streak';
const LAST_VISIT_KEY = '@last_visit';
const CATEGORY_FILTER_KEY = '@category_filter';
const AFFIRMATION_HISTORY_KEY = '@affirmation_history';

// ============ FAVORITES ============
export async function getFavorites() {
  try {
    const value = await AsyncStorage.getItem(FAVORITES_KEY);
    return value ? JSON.parse(value) : [];
  } catch (e) {
    return [];
  }
}

export async function toggleFavorite(id) {
  try {
    const favorites = await getFavorites();
    const index = favorites.indexOf(id);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(id);
    }
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return favorites;
  } catch (e) {
    console.error('Error toggling favorite:', e);
    return [];
  }
}

// ============ NOTIFICATION SETTINGS ============
export async function getNotificationSettings() {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return value ? JSON.parse(value) : {
      enabled: true,
      morningTime: '07:00',
      afternoonTime: '14:00',
      eveningTime: '20:00'
    };
  } catch (e) {
    return null;
  }
}

export async function saveNotificationSettings(settings) {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

// ============ DAILY STREAK ============
export async function getStreak() {
  try {
    const streakData = await AsyncStorage.getItem(STREAK_KEY);
    const lastVisit = await AsyncStorage.getItem(LAST_VISIT_KEY);
    
    if (!streakData || !lastVisit) {
      return { current: 0, longest: 0, lastVisit: null };
    }
    
    return JSON.parse(streakData);
  } catch (e) {
    console.error('Error getting streak:', e);
    return { current: 0, longest: 0, lastVisit: null };
  }
}

export async function updateStreak() {
  try {
    const now = new Date();
    const today = now.toDateString();
    
    const streakData = await getStreak();
    const lastVisitStr = await AsyncStorage.getItem(LAST_VISIT_KEY);
    
    // If never visited before, start streak at 1
    if (!lastVisitStr) {
      const newStreak = { current: 1, longest: 1, lastVisit: today };
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
      await AsyncStorage.setItem(LAST_VISIT_KEY, today);
      return newStreak;
    }
    
    const lastVisit = new Date(lastVisitStr);
    const lastVisitDate = lastVisit.toDateString();
    
    // Already visited today
    if (lastVisitDate === today) {
      return streakData;
    }
    
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = lastVisit.toDateString() === yesterday.toDateString();
    
    let newStreak;
    if (isYesterday) {
      // Continue streak
      const newCurrent = streakData.current + 1;
      newStreak = {
        current: newCurrent,
        longest: Math.max(newCurrent, streakData.longest),
        lastVisit: today
      };
    } else {
      // Streak broken, start over
      newStreak = {
        current: 1,
        longest: streakData.longest,
        lastVisit: today
      };
    }
    
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
    await AsyncStorage.setItem(LAST_VISIT_KEY, today);
    
    return newStreak;
  } catch (e) {
    console.error('Error updating streak:', e);
    return { current: 0, longest: 0, lastVisit: null };
  }
}

// ============ CATEGORY FILTER ============
export async function getCategoryFilter() {
  try {
    const value = await AsyncStorage.getItem(CATEGORY_FILTER_KEY);
    return value ? JSON.parse(value) : 'all'; // 'all', 'faith', 'confidence', 'gratitude', 'peace', 'strength'
  } catch (e) {
    return 'all';
  }
}

export async function saveCategoryFilter(category) {
  try {
    await AsyncStorage.setItem(CATEGORY_FILTER_KEY, JSON.stringify(category));
  } catch (e) {
    console.error('Error saving category filter:', e);
  }
}

// ============ AFFIRMATION HISTORY ============
// Track which affirmations user has seen to avoid repeats
export async function getAffirmationHistory() {
  try {
    const value = await AsyncStorage.getItem(AFFIRMATION_HISTORY_KEY);
    return value ? JSON.parse(value) : [];
  } catch (e) {
    return [];
  }
}

export async function addToHistory(id) {
  try {
    let history = await getAffirmationHistory();
    if (!history.includes(id)) {
      history.push(id);
      // Keep only last 50 to allow cycling
      if (history.length > 50) {
        history = history.slice(-50);
      }
      await AsyncStorage.setItem(AFFIRMATION_HISTORY_KEY, JSON.stringify(history));
    }
  } catch (e) {
    console.error('Error adding to history:', e);
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.setItem(AFFIRMATION_HISTORY_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Error clearing history:', e);
  }
}
