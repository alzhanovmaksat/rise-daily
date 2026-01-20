import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function AffirmationCard({ affirmation, timeOfDay, isFavorite, onToggleFavorite }) {
  const getGradientColors = () => {
    switch (timeOfDay) {
      case 'morning':
        return ['#FF6B6B', '#FFE66D', '#4ECDC4'];
      case 'afternoon':
        return ['#00B4DB', '#0083B0', '#3A7BD5'];
      case 'evening':
        return ['#6A11CB', '#2575FC', '#1E3A8A'];
      default:
        return ['#4A90E2', '#357ABD', '#2C6BA8'];
    }
  };

  return (
    <LinearGradient colors={getGradientColors()} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.favoriteButton} onPress={onToggleFavorite}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={28} color="white" />
        </TouchableOpacity>

        <Text style={styles.text}>{affirmation.text}</Text>
        
        <View style={styles.footer}>
          <View style={styles.sourceContainer}>
            <Ionicons name={affirmation.type === 'bible' ? 'book' : 'bulb'} size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.source}>{affirmation.source}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 24, minHeight: 280, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  content: { flex: 1, justifyContent: 'center' },
  favoriteButton: { position: 'absolute', top: -8, right: -8, padding: 8 },
  text: { fontSize: 22, lineHeight: 32, color: 'white', fontWeight: '600', textAlign: 'center', marginBottom: 24, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  footer: { alignItems: 'center' },
  sourceContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  source: { fontSize: 14, color: 'rgba(255,255,255,0.95)', fontWeight: '500', marginLeft: 6 }
});
