import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/contexts/InventoryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { settings, updateSettings } = useInventory();
  const { t, language, setLanguage } = useLanguage();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleLogout = () => {
    Alert.alert(t('logout'), '', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 20 }]}
        bottomOffset={20}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('lowStockPercent')}</Text>
          <Text style={styles.sectionDesc}>{t('lowStockDesc')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.settingInput}
              value={String(settings.lowStockPercent)}
              onChangeText={(val) => {
                const num = parseInt(val, 10);
                if (!isNaN(num) && num >= 0 && num <= 100) {
                  updateSettings({ lowStockPercent: num });
                } else if (val === '') {
                  updateSettings({ lowStockPercent: 0 });
                }
              }}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.unitLabel}>%</Text>
          </View>
          <View style={[styles.colorSample, { backgroundColor: Colors.highlightYellow }]}>
            <Ionicons name="warning" size={16} color="#F9A825" />
            <Text style={styles.colorSampleText}>Low stock highlight</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('noChangeDays')}</Text>
          <Text style={styles.sectionDesc}>{t('noChangeDaysDesc')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.settingInput}
              value={String(settings.noChangeDays)}
              onChangeText={(val) => {
                const num = parseInt(val, 10);
                if (!isNaN(num) && num >= 0) {
                  updateSettings({ noChangeDays: num });
                } else if (val === '') {
                  updateSettings({ noChangeDays: 0 });
                }
              }}
              keyboardType="number-pad"
              maxLength={4}
            />
            <Text style={styles.unitLabel}>{language === 'hi' ? 'दिन' : 'days'}</Text>
          </View>
          <View style={[styles.colorSample, { backgroundColor: Colors.highlightBlue }]}>
            <Ionicons name="time" size={16} color="#1565C0" />
            <Text style={styles.colorSampleText}>No change highlight</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.langRow}>
            <Pressable
              style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
              onPress={() => { setLanguage('en'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
                {t('english')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.langBtn, language === 'hi' && styles.langBtnActive]}
              onPress={() => { setLanguage('hi'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Text style={[styles.langBtnText, language === 'hi' && styles.langBtnTextActive]}>
                {t('hindi')}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/about')}
          >
            <View style={styles.menuRowLeft}>
              <Ionicons name="information-circle" size={24} color={Colors.primary} />
              <Text style={styles.menuRowText}>{t('aboutFounder')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Legend</Text>
          <View style={styles.legendGrid}>
            <View style={[styles.legendItem, { backgroundColor: Colors.highlightRed }]}>
              <MaterialIcons name="error" size={18} color="#C62828" />
              <Text style={styles.legendText}>{language === 'hi' ? 'समाप्ति निकट' : 'Near Expiry'}</Text>
            </View>
            <View style={[styles.legendItem, { backgroundColor: Colors.highlightYellow }]}>
              <Ionicons name="warning" size={18} color="#F9A825" />
              <Text style={styles.legendText}>{language === 'hi' ? 'कम स्टॉक' : 'Low Stock'}</Text>
            </View>
            <View style={[styles.legendItem, { backgroundColor: Colors.highlightBlue }]}>
              <Ionicons name="time" size={18} color="#1565C0" />
              <Text style={styles.legendText}>{language === 'hi' ? 'कोई बदलाव नहीं' : 'No Change'}</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={22} color="#E53935" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </Pressable>
      </KeyboardAwareScrollViewCompat>
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
  section: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gray900,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray500,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingInput: {
    backgroundColor: Colors.gray100,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    minWidth: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  unitLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.gray600,
  },
  colorSample: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  colorSampleText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray700,
  },
  langRow: {
    flexDirection: 'row',
    gap: 12,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  langBtnActive: {
    backgroundColor: Colors.primaryLighter,
    borderColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gray600,
  },
  langBtnTextActive: {
    color: Colors.primary,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuRowText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.gray800,
  },
  legendGrid: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.gray800,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#E53935',
  },
});
