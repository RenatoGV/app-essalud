import {View, Text, TouchableOpacity, Modal, StyleSheet, Alert, TouchableWithoutFeedback } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../constants/styles';

export default function ImagePickerModal({ visible, onClose, onImageSelected }) {
   const pickImageFromGallery = async () => {
      onClose();
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!granted) {
         Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para cambiar la foto.');
         return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ['images'],
         allowsEditing: true,
         aspect: [1, 1],
         quality: 0.8,
      });

      if (!result.canceled) {
         onImageSelected(result.assets[0].uri);
      }
   };

   const takePhotoWithCamera = async () => {
      onClose();
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();

      if (!granted) {
         Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para tomar una foto.');
         return;
      }

      const result = await ImagePicker.launchCameraAsync({
         allowsEditing: true,
         aspect: [1, 1],
         quality: 0.8,
      });

      if (!result.canceled) {
         onImageSelected(result.assets[0].uri);
      }
   }

   return (
      <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose} >
         <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.modalOverlay} />
         </TouchableWithoutFeedback>

         <View style={styles.bottomSheet}>
            <View style={styles.dragHandle} />
            <Text style={styles.modalTitle}>Seleccionar foto de perfil</Text>

            <TouchableOpacity style={styles.optionButton} onPress={pickImageFromGallery}>
               <Ionicons name="images-outline" size={24} color={colors.input} />
               <Text style={styles.optionText}>
                  Seleccionar de la galería
               </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={takePhotoWithCamera}>
               <Ionicons name="camera-outline" size={24} color={colors.input} />
               <Text style={styles.optionText}>
                  Tomar una foto
               </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
               <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
         </View>
      </Modal>
   );
}

const styles = StyleSheet.create({
   modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
   },
   bottomSheet: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: 30,
      paddingTop: 12,
      position: 'absolute',
      bottom: 0,
      width: '100%',
   },
   dragHandle: {
      width: 40,
      height: 5,
      backgroundColor: '#ccc',
      borderRadius: 5,
      alignSelf: 'center',
      marginBottom: 15,
   },
   modalTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 15,
      textAlign: 'center',
   },
   optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      gap: 12,
   },
   optionText: {
      fontSize: 16,
      color: colors.input,
      fontWeight: '500',
   },
   cancelButton: {
      marginTop: 10,
      justifyContent: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: '#eee',
      paddingVertical: 14,
   },
   cancelText: {
      fontSize: 16,
      color: colors.danger,
      fontWeight: '600',
      textAlign: 'center',
   },
});