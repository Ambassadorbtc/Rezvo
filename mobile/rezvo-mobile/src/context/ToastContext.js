import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Toast Context
const ToastContext = createContext(null);

export const useGlobalToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useGlobalToast must be used within ToastProvider');
  }
  return context;
};

// Confirmation Dialog Context
const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ToastProvider');
  }
  return context;
};

// Toast Component
const Toast = ({ visible, message, type }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && opacity._value === 0) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return { bg: '#ECFDF5', border: '#10B981', icon: '#059669' };
      case 'error': return { bg: '#FEF2F2', border: '#EF4444', icon: '#DC2626' };
      case 'warning': return { bg: '#FFFBEB', border: '#F59E0B', icon: '#D97706' };
      default: return { bg: '#EFF6FF', border: '#3B82F6', icon: '#2563EB' };
    }
  };

  const colors = getColors();

  return (
    <Animated.View style={[styles.toastContainer, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.toast, { backgroundColor: colors.bg, borderLeftColor: colors.border }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.border + '20' }]}>
          <Ionicons name={getIcon()} size={22} color={colors.icon} />
        </View>
        <Text style={styles.toastMessage}>{message}</Text>
      </View>
    </Animated.View>
  );
};

// Confirmation Dialog Component
const ConfirmDialog = ({ visible, title, message, confirmText, cancelText, onConfirm, onCancel, type }) => {
  const getColors = () => {
    switch (type) {
      case 'danger': return { button: '#EF4444', buttonText: '#FFFFFF' };
      case 'warning': return { button: '#F59E0B', buttonText: '#FFFFFF' };
      default: return { button: '#14B8A6', buttonText: '#FFFFFF' };
    }
  };

  const colors = getColors();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <Pressable style={styles.dialogContainer} onPress={e => e.stopPropagation()}>
          <View style={styles.dialogContent}>
            {type === 'danger' && (
              <View style={styles.dialogIconDanger}>
                <Ionicons name="trash-outline" size={28} color="#EF4444" />
              </View>
            )}
            <Text style={styles.dialogTitle}>{title}</Text>
            <Text style={styles.dialogMessage}>{message}</Text>
            
            <View style={styles.dialogButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>{cancelText || 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: colors.button }]} 
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Text style={[styles.confirmButtonText, { color: colors.buttonText }]}>{confirmText || 'Confirm'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Provider Component
export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [confirm, setConfirm] = useState({ 
    visible: false, 
    title: '', 
    message: '', 
    confirmText: '',
    cancelText: '',
    type: 'default',
    onConfirm: () => {},
    onCancel: () => {}
  });
  
  const toastTimeout = useRef(null);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }
    setToast({ visible: true, message, type });
    toastTimeout.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  const showSuccess = useCallback((message) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message) => showToast(message, 'error'), [showToast]);
  const showInfo = useCallback((message) => showToast(message, 'info'), [showToast]);
  const showWarning = useCallback((message) => showToast(message, 'warning'), [showToast]);

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirm({
        visible: true,
        title: options.title || 'Confirm',
        message: options.message || 'Are you sure?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'default',
        onConfirm: () => {
          setConfirm(prev => ({ ...prev, visible: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirm(prev => ({ ...prev, visible: false }));
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      <ConfirmContext.Provider value={{ showConfirm }}>
        {children}
        <Toast visible={toast.visible} message={toast.message} type={toast.type} />
        <ConfirmDialog {...confirm} />
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 99999,
  },
  toast: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 340,
  },
  dialogContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  dialogIconDanger: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1626',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ToastProvider;
