import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/styles';
import { useRef, useState } from 'react';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';

export default function ProfileInput({ value, setValue, placeholder, columnName }) {
   const [editing, setEditing] = useState(false);
   const [saving, setSaving] = useState(false);
   const [previousValue, setPreviousValue] = useState(value);

   const inputRef = useRef(null);
   const { updateProfile } = useAppData();

   const handleEdit = () => {
      setPreviousValue(value);
      setEditing(true);
   };

   const handleSave = async () => {
      try {
         setSaving(true);
         await updateProfile(columnName, value);

         setEditing(false);
      } catch (error) {
         console.error('Error actualizando perfil:', error);
      } finally {
         setSaving(false);
      }
   };

   const handleCancel = () => {
      setValue(previousValue);
      setEditing(false);
   };

   return (
      <View style={styles.inputContainer}>
         {
            editing ?
               <TextInput
                  style={styles.input}
                  ref={inputRef}
                  value={value}
                  placeholder={placeholder}
                  placeholderTextColor={colors.input}
                  keyboardType="default"
                  autoCapitalize="none"
                  onChangeText={setValue}
                  autoFocus={true}
                  editable={!saving}
               />
               :
               <Text style={[styles.input, !value && { color: colors.input }]}>
                  {value || placeholder}
               </Text>
         }

         {
            editing ?
               <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={handleSave} disabled={saving}>
                     {
                        saving ? <ActivityIndicator size="small" /> : <FontAwesome name="check" size={20} color={colors.input} />
                     }
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleCancel} disabled={saving}>
                        <FontAwesome name="close" size={20} color={colors.input} />
                  </TouchableOpacity>
               </View>
               : <TouchableOpacity onPress={handleEdit}>
                  <MaterialIcons name="edit" size={20} color={colors.input} />
               </TouchableOpacity>
         }
      </View>
   );
}


const styles = StyleSheet.create({
   inputContainer: {
      width: "100%",
      height: 43,
      flexDirection: "row",
      borderColor: colors.input,
      borderWidth: 2,
      paddingHorizontal: 10,
      borderRadius: 5,
      backgroundColor: "white",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
   },
   input: {
      flex: 1
   }
})