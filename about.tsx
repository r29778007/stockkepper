import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('aboutFounder')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 20 }]}
      >
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          style={styles.profileCard}
        >
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.founderName}>Prince Agrawal</Text>
          <Text style={styles.founderRole}>Founder & Visionary</Text>
        </LinearGradient>

        <View style={styles.bioCard}>
          <Text style={styles.bioText}>
            Prince Agrawal Sir is the visionary founder behind Stock Manager, a revolutionary inventory management solution designed specifically for Indian shopkeepers.
          </Text>
          <Text style={styles.bioText}>
            As a young and dynamic entrepreneur, Prince recognized the challenges that small business owners face in managing their daily inventory. His passion for technology and deep understanding of ground-level business operations led him to create a simple yet powerful tool that empowers shopkeepers across India.
          </Text>
          <Text style={styles.bioText}>
            With an unwavering commitment to Digital India, Prince has dedicated himself to building smart, accessible solutions that bridge the gap between traditional commerce and modern technology. His work exemplifies the spirit of innovation that drives the new generation of Indian tech leaders.
          </Text>
          <Text style={styles.bioText}>
            Prince believes that every shopkeeper deserves access to professional-grade inventory tools, regardless of their technical background. This philosophy of inclusive design and user-first thinking makes Stock Manager not just an app, but a movement towards empowering small businesses everywhere.
          </Text>
          <Text style={styles.bioText}>
            His leadership, determination, and relentless pursuit of excellence serve as an inspiration to aspiring entrepreneurs. Prince Agrawal is not just building software -- he is building the future of Indian retail, one shopkeeper at a time.
          </Text>
        </View>

        <View style={styles.quoteCard}>
          <Ionicons name="sparkles" size={24} color={Colors.primary} />
          <Text style={styles.quoteText}>
            "Technology should simplify life, not complicate it. Every shopkeeper deserves the power of smart inventory management."
          </Text>
          <Text style={styles.quoteAuthor}>- Prince Agrawal</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  profileCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  founderName: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
  },
  founderRole: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  bioCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  bioText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray700,
    lineHeight: 24,
  },
  quoteCard: {
    backgroundColor: Colors.primaryLighter,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  quoteText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.primaryDark,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
});
