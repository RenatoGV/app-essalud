import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../constants/styles';

export default function AppointmentDetailsScreen() {

    const openMap = () => {
        void Linking.openURL('https://maps.google.com/?q=-12.0811,-77.0369');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <Text style={[styles.cardSectionTitle, { color: colors.primary }]}>ESPECIALIDAD</Text>
                    <Text style={styles.mainTitle}>Cardiología</Text>

                    <View style={[styles.infoBox, { backgroundColor: colors.softBackground, borderColor: colors.primary }]}>
                        <MaterialIcons name="calendar-today" size={24} color={colors.primary} />
                        <View style={styles.infoBoxTextContainer}>
                            <Text style={styles.boldText}>Miércoles, 24 de Mayo del 2026</Text>
                            <View style={styles.rowCenter}>
                                <Text style={styles.subText}>10:30 a.m.</Text>
                                <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                                    <Text style={styles.badgeText}>Turno mañana</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.infoBox, { backgroundColor: colors.softBackground, borderColor: colors.primary, marginTop: 10 }]}>
                        <MaterialCommunityIcons name="bell" size={24} color={colors.primary} />
                        <Text style={[styles.infoText, { marginLeft: 10, flex: 1 }]}>
                            Recuerda presentarte con tu DNI en mano.
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={[styles.cardSectionTitle, { color: colors.primary }]}>MÉDICO ESPECIALIZADO ASIGNADO</Text>
                    
                    <View style={styles.rowCenterTop}>
                        <View style={[styles.avatarContainer, { backgroundColor: colors.softBackground }]}>
                            <Ionicons name="person" size={30} color={colors.primary} />
                        </View>
                        <View style={styles.doctorInfo}>
                            <Text style={styles.boldText}>Dr. Carlos Mendoza</Text>
                            <Text style={styles.grayText}>Cardiólogo clínico</Text>
                            <View style={[styles.darkBadge, { backgroundColor: colors.secondary }]}>
                                <Text style={styles.badgeText}>CPM: 48291</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={[styles.cardSectionTitle, { color: colors.primary }]}>ESTABLECIMIENTO DE SALUD</Text>
                    <Text style={[styles.boldText, { marginBottom: 10 }]}>
                        Hospital Nacional Edgardo Rebagliati Martins
                    </Text>

                    <Image
                        source={require('../../assets/map-image.jpg')}
                        style={styles.mapImage}
                    />

                    <View style={styles.locationBoxes}>
                        <View style={[styles.locBox, { backgroundColor: colors.softBackground, borderColor: colors.primary }]}>
                            <Text style={styles.locBoxTitle}>Pabellón</Text>
                            <Text style={[styles.locBoxValue, { color: colors.primary }]}>B</Text>
                        </View>
                        <View style={[styles.locBox, { backgroundColor: colors.softBackground, borderColor: colors.primary }]}>
                            <Text style={styles.locBoxTitle}>Piso</Text>
                            <Text style={[styles.locBoxValue, { color: colors.primary }]}>2</Text>
                        </View>
                        <View style={[styles.locBox, { backgroundColor: colors.softBackground, borderColor: colors.primary }]}>
                            <Text style={styles.locBoxTitle}>Consultorio</Text>
                            <Text style={[styles.locBoxValue, { color: colors.primary }]}>201</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.mapButton, { backgroundColor: colors.primary }]} onPress={openMap}>
                        <Ionicons name="location-sharp" size={20} color="white" />
                        <Text style={styles.mapButtonText}>Como llegar (Google Maps)</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: colors.input,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    cardSectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    mainTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    infoBoxTextContainer: {
        marginLeft: 12,
    },
    boldText: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    subText: {
        fontSize: 20,
        color: colors.primary,
        fontWeight: 'bold',
        marginTop: 2,
    },
    infoText: {
        color: colors.input
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    rowCenterTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 5,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginLeft: 10,
    },
    darkBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doctorInfo: {
        marginLeft: 15,
        justifyContent: 'center',
    },
    grayText: {
        color: colors.input,
        fontSize: 13,
        marginTop: 2,
    },
    mapImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: colors.softBackground,
    },
    locationBoxes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    locBox: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    locBoxTitle: {
        fontSize: 12,
        color: colors.input,
    },
    locBoxValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    mapButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    mapButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8,
    }
});