import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/styles';
import { useRef, useState } from 'react';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function ProfileInput({ value, setValue, placeholder }) {
   const [editValue, setEditValue] = useState(false)
   const inputRef = useRef(null)

   return (
      <View style={styles.inputContainer}>
         {
            editValue
               ?  <TextInput
                     style={styles.input}
                     ref={inputRef}
                     value={value}
                     placeholder={placeholder}
                     placeholderTextColor={colors.input}
                     keyboardType="default"
                     autoCapitalize="none"
                     onChangeText={setValue}
                     autoFocus={true}
                  />
               :  <Text style={styles.input}>{value}</Text>
         }

         {
            editValue
               ?  <View style={{ flexDirection: 'row', gap: 10 }}>
                     <TouchableOpacity onPress={() => setEditValue(false)}>
                        <FontAwesome name="check" size={20} color={colors.input} />
                     </TouchableOpacity>
                     <TouchableOpacity onPress={() => setEditValue(false)}>
                        <FontAwesome name="close" size={20} color={colors.input} />
                     </TouchableOpacity>
                  </View>
               :  <TouchableOpacity onPress={() => setEditValue(true)}>
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