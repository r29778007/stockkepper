import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, Platform, TextInput, Modal, FlatList, Alert
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory, Product, UnitType } from '@/contexts/InventoryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';

const UNITS: UnitType[] = ['pcs', 'kg', 'liter', 'meter', 'box'];

function ProductRow({ product }: { product: Product }) {
  const { incrementQty, decrementQty, updateQuantity, updateUnit, deleteProduct, setProductExpiry, setProductExpiryAlertDays, getRowHighlight } = useInventory();
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [editingQty, setEditingQty] = useState(false);
  const [qtyText, setQtyText] = useState('');
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryInput, setExpiryInput] = useState(product.expiryDate || '');
  const [alertDaysInput, setAlertDaysInput] = useState(String(product.expiryAlertDays));

  const highlight = getRowHighlight(product);
  const bgColor = highlight === 'red' ? Colors.highlightRed
    : highlight === 'yellow' ? Colors.highlightYellow
    : highlight === 'blue' ? Colors.highlightBlue
    : Colors.white;

  const handleQtySubmit = () => {
    const val = parseInt(qtyText, 10);
    if (!isNaN(val)) {
      updateQuantity(product.id, val);
    }
    setEditingQty(false);
  };

  const handleSaveExpiry = () => {
    setProductExpiry(product.id, expiryInput || null);
    const days = parseInt(alertDaysInput, 10);
    if (!isNaN(days) && days >= 0) {
      setProductExpiryAlertDays(product.id, days);
    }
    setShowExpiryModal(false);
  };

  return (
    <View style={[styles.row, { backgroundColor: bgColor }]}>
      <View style={styles.rowTop}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Pressable onPress={() => setShowMenu(true)} hitSlop={8}>
          <MaterialIcons name="more-vert" size={22} color={Colors.gray600} />
        </Pressable>
      </View>

      <View style={styles.rowContent}>
        <View style={styles.qtyBlock}>
          <Text style={styles.qtyLabel}>{t('previousQty')}</Text>
          <Text style={styles.qtyValue}>{product.previousQty} {t(product.unit)}</Text>
        </View>

        <View style={styles.qtyBlock}>
          <Text style={styles.qtyLabel}>{t('currentQty')}</Text>
          {editingQty ? (
            <TextInput
              style={styles.qtyInput}
              value={qtyText}
              onChangeText={setQtyText}
              keyboardType="number-pad"
              autoFocus
              onBlur={handleQtySubmit}
              onSubmitEditing={handleQtySubmit}
            />
          ) : (
            <Pressable onPress={() => { setQtyText(String(product.currentQty)); setEditingQty(true); }}>
              <Text style={[styles.qtyValue, styles.qtyEditable]}>{product.currentQty} {t(product.unit)}</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.unitBlock}>
          <Pressable
            style={styles.unitBtn}
            onPress={() => setShowUnitPicker(true)}
          >
            <Text style={styles.unitText}>{t(product.unit)}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.gray600} />
          </Pressable>
        </View>
      </View>

      <View style={styles.rowActions}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.decrementBtn, pressed && { opacity: 0.7 }]}
          onPress={() => { decrementQty(product.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <Ionicons name="remove" size={22} color={Colors.white} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.incrementBtn, pressed && { opacity: 0.7 }]}
          onPress={() => { incrementQty(product.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </Pressable>
      </View>

      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>{t('productSettings')}</Text>

            <Pressable style={styles.menuItem} onPress={() => { setShowMenu(false); setShowExpiryModal(true); }}>
              <Ionicons name="calendar" size={22} color={Colors.primary} />
              <Text style={styles.menuItemText}>{t('setExpiry')}</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                Alert.alert(t('deleteProduct'), product.name, [
                  { text: t('cancel'), style: 'cancel' },
                  { text: t('deleteProduct'), style: 'destructive', onPress: () => deleteProduct(product.id) },
                ]);
              }}
            >
              <Ionicons name="trash" size={22} color="#E53935" />
              <Text style={[styles.menuItemText, { color: '#E53935' }]}>{t('deleteProduct')}</Text>
            </Pressable>

            <Pressable style={[styles.menuItem, styles.menuCancel]} onPress={() => setShowMenu(false)}>
              <Text style={styles.menuCancelText}>{t('close')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showUnitPicker} transparent animationType="fade" onRequestClose={() => setShowUnitPicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowUnitPicker(false)}>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>{t('unit')}</Text>
            {UNITS.map(u => (
              <Pressable
                key={u}
                style={[styles.menuItem, product.unit === u && { backgroundColor: Colors.primaryLighter }]}
                onPress={() => { updateUnit(product.id, u); setShowUnitPicker(false); }}
              >
                <Text style={styles.menuItemText}>{t(u)}</Text>
                {product.unit === u && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showExpiryModal} transparent animationType="slide" onRequestClose={() => setShowExpiryModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowExpiryModal(false)}>
          <Pressable style={styles.expiryCard} onPress={() => {}}>
            <Text style={styles.menuTitle}>{t('setExpiry')}</Text>

            <View style={styles.expiryField}>
              <Text style={styles.expiryLabel}>{t('expiryDate')} (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.expiryInput}
                value={expiryInput}
                onChangeText={setExpiryInput}
                placeholder="2025-12-31"
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <View style={styles.expiryField}>
              <Text style={styles.expiryLabel}>{t('expiryAlertDays')}</Text>
              <TextInput
                style={styles.expiryInput}
                value={alertDaysInput}
                onChangeText={setAlertDaysInput}
                keyboardType="number-pad"
                placeholder="7"
                placeholderTextColor={Colors.gray400}
              />
            </View>

            <View style={styles.expiryActions}>
              <Pressable
                style={[styles.expiryBtn, { backgroundColor: Colors.gray200 }]}
                onPress={() => { setExpiryInput(''); setProductExpiry(product.id, null); setShowExpiryModal(false); }}
              >
                <Text style={styles.expiryBtnText}>{t('clearExpiry')}</Text>
              </Pressable>
              <Pressable
                style={[styles.expiryBtn, { backgroundColor: Colors.primary }]}
                onPress={handleSaveExpiry}
              >
                <Text style={[styles.expiryBtnText, { color: Colors.white }]}>{t('save')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { products, addProduct } = useInventory();
  const { t } = useLanguage();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  const handleAddProduct = useCallback(() => {
    if (!newProductName.trim()) return;
    addProduct(newProductName);
    setNewProductName('');
    setShowAddModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newProductName, addProduct]);

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductRow product={item} />
  ), []);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="storefront" size={24} color={Colors.white} />
            <Text style={styles.shopName} numberOfLines={1}>{user?.shopName || t('appTitle')}</Text>
          </View>
          <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
            <Ionicons name="menu" size={28} color={Colors.white} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.gray500} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('searchProducts')}
          placeholderTextColor={Colors.gray400}
        />
        {!!searchQuery && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={Colors.gray400} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        scrollEnabled={!!filteredProducts.length}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={Colors.gray300} />
            <Text style={styles.emptyTitle}>{t('noProducts')}</Text>
            <Text style={styles.emptyDesc}>{t('noProductsDesc')}</Text>
          </View>
        }
      />

      <Pressable
        style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add-circle" size={24} color={Colors.white} />
        <Text style={styles.addBtnText}>{t('addProduct')}</Text>
      </Pressable>

      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.addCard} onPress={() => {}}>
            <Text style={styles.addCardTitle}>{t('addProduct')}</Text>

            <View style={styles.addInputWrap}>
              <Ionicons name="cube" size={22} color={Colors.gray500} />
              <TextInput
                style={styles.addInput}
                value={newProductName}
                onChangeText={setNewProductName}
                placeholder={t('productName')}
                placeholderTextColor={Colors.gray400}
                autoFocus
                onSubmitEditing={handleAddProduct}
              />
            </View>

            <View style={styles.addActions}>
              <Pressable
                style={[styles.addActionBtn, { backgroundColor: Colors.gray200 }]}
                onPress={() => { setNewProductName(''); setShowAddModal(false); }}
              >
                <Text style={styles.addActionText}>{t('cancel')}</Text>
              </Pressable>
              <Pressable
                style={[styles.addActionBtn, { backgroundColor: Colors.primary }]}
                onPress={handleAddProduct}
              >
                <Ionicons name="add" size={20} color={Colors.white} />
                <Text style={[styles.addActionText, { color: Colors.white }]}>{t('add')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  shopName: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray900,
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 80,
    gap: 8,
  },
  row: {
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gray900,
    flex: 1,
    marginRight: 8,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  qtyBlock: {
    flex: 1,
    gap: 4,
  },
  qtyLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.gray500,
    textTransform: 'uppercase',
  },
  qtyValue: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gray800,
  },
  qtyEditable: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  qtyInput: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingVertical: 2,
    minWidth: 50,
  },
  unitBlock: {
    justifyContent: 'flex-end',
  },
  unitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  unitText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.gray700,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementBtn: {
    backgroundColor: Colors.primary,
  },
  decrementBtn: {
    backgroundColor: '#E53935',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gray500,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray400,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  addBtnText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    padding: 20,
    gap: 4,
  },
  menuTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.gray900,
    marginBottom: 12,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.gray800,
    flex: 1,
  },
  menuCancel: {
    justifyContent: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingTop: 14,
  },
  menuCancelText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gray500,
    textAlign: 'center',
  },
  addCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    padding: 24,
    gap: 16,
  },
  addCardTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.gray900,
    textAlign: 'center',
  },
  addInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  addInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray900,
  },
  addActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  addActionText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gray700,
  },
  expiryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    padding: 24,
    gap: 16,
  },
  expiryField: {
    gap: 6,
  },
  expiryLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.gray600,
  },
  expiryInput: {
    backgroundColor: Colors.gray100,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray900,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  expiryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  expiryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  expiryBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gray700,
  },
});
