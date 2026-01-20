import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, RefreshControl, ScrollView, 
  TouchableOpacity, Share, Alert, Animated 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import AffirmationCard from '../components/AffirmationCard';
import { affirmations } from '../data/affirmations';
import { 
  CATEGORIES, 
  getCurrentTimeOfDay, 
  getRandomAffirmationFiltered,
  enhanceAffirmation 
} from '../data/affirmationsHelper';
import { 
  getFavorites, toggleFavorite, getStreak, updateStreak,
  getCategoryFilter, saveCategoryFilter, getAffirmationHistory, addToHistory
} from '../utils/storage';

export default function HomeScreen() {
  const [affirmation, setAffirmation] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [history, setHistory] = useState([]);
  
  const streakAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (streak.current > 0) {
      Animated.spring(streakAnimation, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  }, [streak.current]);

  const initializeApp = async () => {
    const [favs, streakData, category, hist] = await Promise.all([
      getFavorites(),
      updateStreak(),
      getCategoryFilter(),
      getAffirmationHistory()
    ]);
    
    setFavorites(favs);
    setStreak(streakData);
    setSelectedCategory(category);
    setHistory(hist);
    
    loadAffirmation(category, hist);
  };

  const loadAffirmation = async (category = selectedCategory, hist = history) => {
    const currentTime = getCurrentTimeOfDay();
    setTimeOfDay(currentTime);
    
    const timeAffirmations = affirmations[currentTime] || affirmations.morning;
    const newAffirmation = getRandomAffirmationFiltered(timeAffirmations, category, hist);
    
    if (newAffirmation) {
      setAffirmation(newAffirmation);
      await addToHistory(newAffirmation.id);
      setHistory(prev => [...prev, newAffirmation.id]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAffirmation();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (id) => {
    const newFavorites = await toggleFavorite(id);
    setFavorites(newFavorites);
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    await saveCategoryFilter(category);
    await loadAffirmation(category, history);
  };

  const handleShare = async () => {
    if (!affirmation) return;
    
    try {
      await Share.share({
        message: `"${affirmation.text}"\n\n— ${affirmation.source}\n\nShared from Rise Daily App ☀️`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share affirmation');
    }
  };

  const getGreeting = () => {
    switch (timeOfDay) {
      case 'morning': return '🌅 Good Morning';
      case 'afternoon': return '☀️ Good Afternoon';
      case 'evening': return '🌙 Good Evening';
      default: return 'Hello';
    }
  };

  const streakScale = streakAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Streak */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.subtitle}>Your daily inspiration awaits</Text>
            </View>
            
            {/* Streak Badge */}
            <Animated.View style={[styles.streakBadge, { transform: [{ scale: streakScale }] }]}>
              <Ionicons name="flame" size={24} color="#FF6B35" />
              <Text style={styles.streakNumber}>{streak.current}</Text>
              <Text style={styles.streakLabel}>day{streak.current !== 1 ? 's' : ''}</Text>
            </Animated.View>
          </View>
          
          {streak.longest > 1 && (
            <Text style={styles.longestStreak}>
              🏆 Longest streak: {streak.longest} days
            </Text>
          )}
        </View>

        {/* Category Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {Object.entries(CATEGORIES).map(([key, { label, icon, color }]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.categoryChip,
                selectedCategory === key && { backgroundColor: color }
              ]}
              onPress={() => handleCategoryChange(key)}
            >
              <Ionicons 
                name={icon} 
                size={16} 
                color={selectedCategory === key ? 'white' : color} 
              />
              <Text style={[
                styles.categoryLabel,
                selectedCategory === key && styles.categoryLabelSelected
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Affirmation Card */}
        {affirmation && (
          <AffirmationCard
            affirmation={affirmation}
            timeOfDay={timeOfDay}
            isFavorite={favorites.includes(affirmation.id)}
            onToggleFavorite={() => handleToggleFavorite(affirmation.id)}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={22} color="#4A90E2" />
            <Text style={styles.actionText}>New</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color="#4A90E2" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>Pull down to refresh • Tap categories to filter</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  scrollContent: { 
    padding: 20, 
    paddingTop: 60 
  },
  header: { 
    marginBottom: 20 
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 4 
  },
  subtitle: { 
    fontSize: 15, 
    color: '#666' 
  },
  streakBadge: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 70,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 2,
  },
  streakLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: -2,
  },
  longestStreak: {
    fontSize: 13,
    color: '#888',
    marginTop: 10,
  },
  categoryScroll: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  categoryLabelSelected: {
    color: 'white',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 15,
    color: '#4A90E2',
    fontWeight: '600',
  },
  hint: { 
    textAlign: 'center', 
    color: '#999', 
    fontSize: 13, 
    marginTop: 20 
  },
});
