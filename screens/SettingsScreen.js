import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Switch, ScrollView, 
  TouchableOpacity, Alert, Linking 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { CATEGORIES } from '../data/affirmationsHelper';
import { 
  getNotificationSettings, saveNotificationSettings,
  getStreak, getCategoryFilter, saveCategoryFilter, clearHistory
} from '../utils/storage';
import { scheduleNotifications, cancelAllNotifications } from '../services/notificationService';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [settings, setSettings] = useState({
    morningTime: '07:00',
    afternoonTime: '14:00',
    eveningTime: '20:00'
  });
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [defaultCategory, setDefaultCategory] = useState('all');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const [notifSettings, streakData, category] = await Promise.all([
      getNotificationSettings(),
      getStreak(),
      getCategoryFilter()
    ]);
    
    if (notifSettings) {
      setNotificationsEnabled(notifSettings.enabled);
      setSettings(notifSettings);
    }
    setStreak(streakData);
    setDefaultCategory(category);
  };

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    const newSettings = { ...settings, enabled: value };
    await saveNotificationSettings(newSettings);
    
    if (value) {
      await scheduleNotifications(settings);
    } else {
      await cancelAllNotifications();
    }
  };

  const handleCategoryChange = async (category) => {
    setDefaultCategory(category);
    await saveCategoryFilter(category);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will reset which affirmations you\'ve seen, allowing them to appear again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            Alert.alert('Done', 'Affirmation history cleared');
          }
        }
      ]
    );
  };

  const handleRateApp = () => {
    // Replace with your actual App Store link when published
    Linking.openURL('https://apps.apple.com/app/id123456789');
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@dailyaffirmations.app?subject=App%20Feedback');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your experience</Text>
        </View>

        {/* Streak Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flame" size={28} color="#FF6B35" />
            </View>
            <Text style={styles.statValue}>{streak.current}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trophy" size={28} color="#F39C12" />
            </View>
            <Text style={styles.statValue}>{streak.longest}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications" size={22} color="#4A90E2" />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Daily Notifications</Text>
                <Text style={styles.rowDescription}>Receive affirmations 3x daily</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#D1D1D6', true: '#4A90E2' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {notificationsEnabled && (
            <View style={styles.timesContainer}>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>🌅 Morning</Text>
                <Text style={styles.timeValue}>{settings.morningTime}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>☀️ Afternoon</Text>
                <Text style={styles.timeValue}>{settings.afternoonTime}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>🌙 Evening</Text>
                <Text style={styles.timeValue}>{settings.eveningTime}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Default Category Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Category</Text>
          <Text style={styles.sectionDescription}>
            Choose which category to show by default
          </Text>
          
          <View style={styles.categoryGrid}>
            {Object.entries(CATEGORIES).map(([key, { label, icon, color }]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryOption,
                  defaultCategory === key && { 
                    backgroundColor: color,
                    borderColor: color 
                  }
                ]}
                onPress={() => handleCategoryChange(key)}
              >
                <Ionicons 
                  name={icon} 
                  size={20} 
                  color={defaultCategory === key ? 'white' : color} 
                />
                <Text style={[
                  styles.categoryOptionLabel,
                  defaultCategory === key && styles.categoryOptionLabelSelected
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity style={styles.menuRow} onPress={handleClearHistory}>
            <View style={styles.rowLeft}>
              <Ionicons name="refresh" size={22} color="#E74C3C" />
              <Text style={styles.menuRowLabel}>Clear Affirmation History</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.menuRow} onPress={handleRateApp}>
            <View style={styles.rowLeft}>
              <Ionicons name="star" size={22} color="#F39C12" />
              <Text style={styles.menuRowLabel}>Rate This App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuRow} onPress={handleContact}>
            <View style={styles.rowLeft}>
              <Ionicons name="mail" size={22} color="#4A90E2" />
              <Text style={styles.menuRowLabel}>Send Feedback</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.appName}>Daily Affirmations</Text>
          <Text style={styles.version}>Version 1.1.0</Text>
          <Text style={styles.infoText}>300+ inspiring affirmations</Text>
          <Text style={styles.infoText}>Bible verses & motivational quotes</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  content: { 
    padding: 20, 
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: { 
    marginBottom: 24 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 4 
  },
  subtitle: { 
    fontSize: 15, 
    color: '#666' 
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#EEE',
  },
  section: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333', 
    marginBottom: 4 
  },
  sectionDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: '#333',
  },
  rowDescription: { 
    fontSize: 13, 
    color: '#888',
    marginTop: 2,
  },
  timesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  timeRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 10,
  },
  timeLabel: { 
    fontSize: 15, 
    color: '#555' 
  },
  timeValue: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#4A90E2' 
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  categoryOptionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  categoryOptionLabelSelected: {
    color: 'white',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuRowLabel: {
    fontSize: 15,
    color: '#333',
  },
  infoSection: { 
    alignItems: 'center',
    paddingVertical: 24,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  infoText: { 
    fontSize: 13, 
    color: '#888', 
    marginBottom: 4 
  },
});
