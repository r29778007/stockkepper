import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export type UnitType = 'pcs' | 'kg' | 'liter' | 'meter' | 'box';

export interface Product {
  id: string;
  name: string;
  previousQty: number;
  currentQty: number;
  unit: UnitType;
  lastChanged: string;
  expiryDate: string | null;
  expiryAlertDays: number;
  createdAt: string;
}

export interface AppSettings {
  lowStockPercent: number;
  noChangeDays: number;
}

interface InventoryContextValue {
  products: Product[];
  settings: AppSettings;
  addProduct: (name: string) => void;
  updateQuantity: (id: string, newQty: number) => void;
  incrementQty: (id: string) => void;
  decrementQty: (id: string) => void;
  updateUnit: (id: string, unit: UnitType) => void;
  deleteProduct: (id: string) => void;
  setProductExpiry: (id: string, date: string | null) => void;
  setProductExpiryAlertDays: (id: string, days: number) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  getRowHighlight: (product: Product) => string | null;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

const DEFAULT_SETTINGS: AppSettings = {
  lowStockPercent: 20,
  noChangeDays: 30,
};

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('inventory_products'),
      AsyncStorage.getItem('inventory_settings'),
    ]).then(([productsStr, settingsStr]) => {
      if (productsStr) setProducts(JSON.parse(productsStr));
      if (settingsStr) setSettings(JSON.parse(settingsStr));
    });
  }, []);

  const saveProducts = useCallback((newProducts: Product[]) => {
    setProducts(newProducts);
    AsyncStorage.setItem('inventory_products', JSON.stringify(newProducts));
  }, []);

  const addProduct = useCallback((name: string) => {
    const newProduct: Product = {
      id: Crypto.randomUUID(),
      name: name.trim(),
      previousQty: 0,
      currentQty: 0,
      unit: 'pcs',
      lastChanged: new Date().toISOString(),
      expiryDate: null,
      expiryAlertDays: 7,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => {
      const updated = [...prev, newProduct];
      AsyncStorage.setItem('inventory_products', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((id: string, newQty: number) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            previousQty: p.currentQty,
            currentQty: Math.max(0, newQty),
            lastChanged: new Date().toISOString(),
          };
        }
        return p;
      });
      AsyncStorage.setItem('inventory_products', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const incrementQty = useCallback((id: string) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            previousQty: p.currentQty,
            currentQty: p.currentQty + 1,
            lastChanged: new Date().toISOString(),
          };
        }
        return p;
      });
      AsyncStorage.setItem('inventory_products', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const decrementQty = useCallback((id: string) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === id && p.currentQty > 0) {
          return {
            ...p,
            previousQty: p.currentQty,
            currentQty: p.currentQty - 1,
            lastChanged: new Date().toISOString(),
          };
        }
        return p;
      });
      AsyncStorage.setItem('inventory_products', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateUnit = useCallback((id: string, unit: UnitType) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, unit } : p);
      AsyncStorage.setItem('inventory_products', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      AsyncStorage.setItem('inventory_products', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setProductExpiry = useCallback((id: string, date: string | null) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, expiryDate: date } : p);
      AsyncStorage.setItem('inventory_products', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setProductExpiryAlertDays = useCallback((id: string, days: number) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, expiryAlertDays: days } : p);
      AsyncStorage.setItem('inventory_products', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      AsyncStorage.setItem('inventory_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getRowHighlight = useCallback((product: Product): string | null => {
    if (product.expiryDate) {
      const expiryTime = new Date(product.expiryDate).getTime();
      const now = Date.now();
      const daysUntilExpiry = (expiryTime - now) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry <= product.expiryAlertDays && daysUntilExpiry >= 0) {
        return 'red';
      }
      if (daysUntilExpiry < 0) {
        return 'red';
      }
    }

    if (settings.lowStockPercent > 0 && product.previousQty > 0) {
      const dropPercent = ((product.previousQty - product.currentQty) / product.previousQty) * 100;
      if (dropPercent >= settings.lowStockPercent) {
        return 'yellow';
      }
    }

    if (settings.noChangeDays > 0) {
      const lastChanged = new Date(product.lastChanged).getTime();
      const daysSinceChange = (Date.now() - lastChanged) / (1000 * 60 * 60 * 24);
      if (daysSinceChange >= settings.noChangeDays) {
        return 'blue';
      }
    }

    return null;
  }, [settings]);

  const value = useMemo(() => ({
    products,
    settings,
    addProduct,
    updateQuantity,
    incrementQty,
    decrementQty,
    updateUnit,
    deleteProduct,
    setProductExpiry,
    setProductExpiryAlertDays,
    updateSettings,
    getRowHighlight,
  }), [products, settings, addProduct, updateQuantity, incrementQty, decrementQty, updateUnit, deleteProduct, setProductExpiry, setProductExpiryAlertDays, updateSettings, getRowHighlight]);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
