import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';

const SIMULATED_CODE = '1234';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { getAllUsers, login } = useAuth();
  const { t } = useLanguage();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('', t('emailRequired'));
      return;
    }
    const users = await getAllUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      Alert.alert('', t('invalidCredentials'));
      return;
    }
    setCodeSent(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleVerify = async () => {
    if (code === SIMULATED_CODE) {
      const users = await getAllUsers();
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        await login(found.email, found.password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/dashboard');
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('', 'Invalid code. ' + t('codeHint'));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('forgotPassword')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {!codeSent ? (
          <>
            <View style={styles.iconArea}>
              <View style={styles.iconCircle}>
                <Ionicons name="key" size={48} color={Colors.primary} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('emailId')}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail" size={20} color={Colors.gray500} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('emailId')}
                  placeholderTextColor={Colors.gray400}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
              onPress={handleSendCode}
            >
              <Ionicons name="send" size={20} color={Colors.white} />
              <Text style={styles.submitText}>{t('enterCode')}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.iconArea}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.hintText}>{t('codeHint')}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('verificationCode')}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="keypad" size={20} color={Colors.gray500} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                  placeholder="1234"
                  placeholderTextColor={Colors.gray400}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
              onPress={handleVerify}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              <Text style={styles.submitText}>{t('verify')}</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  iconArea: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.gray600,
    backgroundColor: Colors.primaryLighter,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.gray700,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray900,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
    marginTop: 8,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
  },
});
