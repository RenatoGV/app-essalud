import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/styles';

export default function HomeButtonItem({ title, subtitle, Icon, onPress }) {
   return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
         <View style={styles.iconContainer}>
            <Icon color={colors.primary} size={25} />
         </View>
         <Text style={styles.title}>{title}</Text>
         <Text style={styles.subtitle}>{subtitle}</Text>
      </TouchableOpacity>
   );
}


const styles = StyleSheet.create({
   container: {
      width: '100%',
      borderColor: colors.input,
      borderWidth: 2,
      padding: 10,
      borderRadius: 10
   },
   iconContainer: {
      alignSelf: 'flex-start',
      backgroundColor: colors.softBackground,
      padding: 5,
      borderRadius: 10,
      marginBottom: 10
   },
   title: {
      fontSize: 18,
      fontWeight: 'bold',
   },
   subtitle: {
      fontSize: 12,
      color: colors.input
   }
})