import { useState } from "react";
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/styles";

export default function SearchableSelector({
   label,
   data = [],
   selectedItem,
   onSelect,
   getLabel,
   placeholder = "Seleccione una opción",
}) {
   const [visible, setVisible] = useState(false);

   const handleSelect = (item) => {
      onSelect(item);
      setVisible(false);
   };

   return (
      <>
         <View style={styles.container}>
            <Pressable style={styles.selector} onPress={() => setVisible(true)}>
               <Text style={styles.selectorText} numberOfLines={1}>
                  {selectedItem ? getLabel(selectedItem) : placeholder}
               </Text>

               <Ionicons name="chevron-down" size={18} color={colors.input} />
            </Pressable>
         </View>

         <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={() => setVisible(false)}
         >
            <View style={styles.modalOverlay}>
               <Pressable
                  style={StyleSheet.absoluteFill}
                  onPress={() => setVisible(false)}
               />

               <View style={styles.modalDropdown}>
                  <Text style={styles.modalTitle}>{label}</Text>

                  <FlatList
                     data={data}
                     keyExtractor={(item) => String(item.id)}
                     showsVerticalScrollIndicator
                     nestedScrollEnabled
                     keyboardShouldPersistTaps="handled"
                     style={styles.list}
                     renderItem={({ item }) => {
                        const isSelected = selectedItem?.id === item.id;

                        return (
                           <Pressable
                              style={[ styles.dropdownItem, isSelected && styles.dropdownItemSelected ]}
                              onPress={() => handleSelect(item)}
                           >
                              <Text style={styles.dropdownText}>
                                 {getLabel(item)}
                              </Text>

                              {isSelected && (
                                 <Ionicons
                                    name="checkmark"
                                    size={18}
                                    color={colors.primary}
                                 />
                              )}
                           </Pressable>
                        );
                     }}
                  />
               </View>
            </View>
         </Modal>
      </>
   );
}

const styles = StyleSheet.create({
   container: {
      position: "relative",
   },
   label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
   },
   selector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1.5,
      borderColor: colors.input,
      borderRadius: 9,
      paddingHorizontal: 14,
      paddingVertical: 13,
      backgroundColor: "white",
   },
   selectorText: {
      flex: 1,
      fontSize: 14,
      marginRight: 10,
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 25,
   },
   modalDropdown: {
      width: "100%",
      maxHeight: 350,
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      elevation: 10,
   },
   modalTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
   },
   list: {
      flexGrow: 0,
      maxHeight: 280,
   },
   dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
   },
   dropdownItemSelected: {
      backgroundColor: colors.softBackground,
   },
   dropdownText: {
      fontSize: 14,
      color: colors.input,
   },
});
