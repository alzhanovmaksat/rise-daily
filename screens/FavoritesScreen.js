import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Share, Alert, RefreshControl 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { affirmations } from '../data/affirmations';
import { getFavoriteAffirmations, CATEGORIES } from '../data/affirmationsHelper';
import { getFavorites, toggleFavorite } from '../utils/storage';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [favoriteAffirmations, setFavoriteAffirmations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const favIds = await getFavorites();
    setFavorites(favIds);
    
    const allAffirmations = {
      morning: affirmations.morning,
      afternoon: affirmations.afternoon,
      evening: affirmations.evening,
    };
    
    const favAffirmations = getFavoriteAffirmations(allAffirmations, favIds);
    setFavoriteAffirmations(favAffirmations);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (id) => {
    await toggleFavorite(id);
    await loadFavorites();
  };

  const handleShare = async (affirmation) => {
    try {
      await Share.share({
        message: `"${affirmation.text}"\n\n— ${affirmation.source}\n\nShared from Rise Daily App ☀️`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share affirmation');
    }
  };

  const filteredAffirmations = filterCategory === 'all' 
    ? favoriteAffirmations 
    : favoriteAffirmations.filter(a => a.category === filterCategory);

  const getCategoryCount = (category) => {
    if (category === 'all') return favoriteAffirmations.length;
    return favoriteAffirmations.filter(a => a.category === category).length;
  };

  const renderAffirmation = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: CATEGORIES[item.category]?.color || '#4A90E2' }]}>
          <Ionicons 
            name={CATEGORIES[item.category]?.icon || 'bookmark'} 
            size={12} 
            color="white" 
          />
          <Text style={styles.categoryBadgeText}>
            {CATEGORIES[item.category]?.label || 'General'}
          </Text>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.cardAction} 
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-outline" size={20} color="#4A90E2" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cardAction} 
            onPress={() => handleRemoveFavorite(item.id)}
          >
            <Ionicons name="heart" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.cardText}>{item.text}</Text>
      
      <View style={styles.cardFooter}>
        <Ionicons 
          name={item.type === 'bible' ? 'book' : 'bulb'} 
          size={14} 
          color="#888" 
        />
        <Text style={styles.cardSource}>{item.source}</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color="#DDD" />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the heart icon on any affirmation to save it here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>
          {favoriteAffirmations.length} saved affirmation{favoriteAffirmations.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      {/* Category Filter */}
      {favoriteAffirmations.length > 0 && (
        <FlatList
          horizontal
          data={Object.entries(CATEGORIES)}
          keyExtractor={([key]) => key}
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
          contentContainerStyle={styles.filterContainer}
          renderItem={({ item: [key, { label, icon, color }] }) => {
            const count = getCategoryCount(key);
            if (key !== 'all' && count === 0) return null;
            
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterCategory === key && { backgroundColor: color }
                ]}
                onPress={() => setFilterCategory(key)}
              >
                <Ionicons 
                  name={icon} 
                  size={14} 
                  color={filterCategory === key ? 'white' : color} 
                />
                <Text style={[
                  styles.filterLabel,
                  filterCategory === key && styles.filterLabelSelected
                ]}>
                  {label} ({count})
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
      
      <FlatList
        data={filteredAffirmations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAffirmation}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  filterList: {
    maxHeight: 50,
    marginBottom: 10,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  filterLabelSelected: {
    color: 'white',
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
    flexGrow: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardAction: {
    padding: 4,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardSource: {
    fontSize: 13,
    color: '#888',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    flex: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
    lineHeight: 20,
  },
});
