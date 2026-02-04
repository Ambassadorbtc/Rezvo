import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const TEAL = '#00BFA5';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [fadeAnim]);

  const showAlert = useCallback((config) => {
    setModal({
      title: config.title || 'Alert',
      message: config.message || '',
      type: config.type || 'info', // success, error, warning, info
      buttons: config.buttons || [{ text: 'OK', onPress: () => {} }],
    });
  }, []);

  const hideModal = useCallback(() => {
    setModal(null);
  }, []);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: '#10B981' };
      case 'error': return { name: 'close-circle', color: '#EF4444' };
      case 'warning': return { name: 'warning', color: '#F59E0B' };
      default: return { name: 'information-circle', color: TEAL };
    }
  };

  const getModalIcon = (type) => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: '#10B981', bg: '#D1FAE5' };
      case 'error': return { name: 'close-circle', color: '#EF4444', bg: '#FEE2E2' };
      case 'warning': return { name: 'warning', color: '#F59E0B', bg: '#FEF3C7' };
      default: return { name: 'information-circle', color: TEAL, bg: '#E8F5F3' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showAlert, hideModal }}>
      {children}
      
      {/* Toast */}
      {toast && (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
          <View style={styles.toast}>
            <View style={styles.toastLogo}>
              <Text style={styles.toastLogoText}>R</Text>
            </View>
            <Ionicons 
              name={getToastIcon(toast.type).name} 
              size={20} 
              color={getToastIcon(toast.type).color} 
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}

      {/* Modal Alert */}
      <Modal
        visible={!!modal}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Logo & Icon */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBg, { backgroundColor: modal ? getModalIcon(modal.type).bg : '#E8F5F3' }]}>
                <Ionicons 
                  name={modal ? getModalIcon(modal.type).name : 'information-circle'} 
                  size={32} 
                  color={modal ? getModalIcon(modal.type).color : TEAL} 
                />
              </View>
            </View>

            {/* Content */}
            <Text style={styles.modalTitle}>{modal?.title}</Text>
            <Text style={styles.modalMessage}>{modal?.message}</Text>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              {modal?.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalButton,
                    index === modal.buttons.length - 1 && styles.modalButtonPrimary,
                    button.style === 'destructive' && styles.modalButtonDestructive,
                  ]}
                  onPress={() => {
                    hideModal();
                    button.onPress?.();
                  }}
                >
                  <Text style={[
                    styles.modalButtonText,
                    index === modal.buttons.length - 1 && styles.modalButtonTextPrimary,
                    button.style === 'destructive' && styles.modalButtonTextDestructive,
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Branding */}
            <View style={styles.modalBranding}>
              <View style={styles.brandingLogo}>
                <Text style={styles.brandingLogoText}>R</Text>
              </View>
              <Text style={styles.brandingText}>rezvo</Text>
            </View>
          </View>
        </View>
      </Modal>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1626',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastLogoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 38, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#FDFBF7',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1626',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#627D98',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    width: '100%',
    gap: 10,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: TEAL,
  },
  modalButtonDestructive: {
    backgroundColor: '#FEE2E2',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#627D98',
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
  },
  modalButtonTextDestructive: {
    color: '#EF4444',
  },
  modalBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    opacity: 0.5,
  },
  brandingLogo: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandingLogoText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#627D98',
  },
});

export default ToastProvider;
