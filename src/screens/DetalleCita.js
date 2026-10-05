import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/styles';

export default function AppointmentDetailsScreen() {
    const navigation = useNavigation();

    const primaryColor = '#1e88e5';
    const headerColor = '#60a5fa';
    const lightBlueBg = '#e0f2fe';
    const darkBlueBadge = '#0f4a8a';

    const openMap = () => {
        Linking.openURL('https://maps.google.com/?q=-12.0811,-77.0369');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={primaryColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: primaryColor }]}>Detalles de la cita</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.card}>
                    <Text style={[styles.cardSectionTitle, { color: headerColor }]}>ESPECIALIDAD</Text>
                    <Text style={styles.mainTitle}>Cardiología</Text>

                    <View style={[styles.infoBox, { backgroundColor: lightBlueBg, borderColor: headerColor }]}>
                        <MaterialIcons name="calendar-today" size={24} color={primaryColor} />
                        <View style={styles.infoBoxTextContainer}>
                            <Text style={styles.boldText}>Miércoles, 24 de Mayo del 2026</Text>
                            <View style={styles.rowCenter}>
                                <Text style={styles.subText}>10:30 a.m.</Text>
                                <View style={[styles.badge, { backgroundColor: darkBlueBadge }]}>
                                    <Text style={styles.badgeText}>Turno mañana</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.infoBox, { backgroundColor: lightBlueBg, borderColor: headerColor, marginTop: 10 }]}>
                        <MaterialCommunityIcons name="bell" size={24} color={primaryColor} />
                        <Text style={[styles.subText, { marginLeft: 10, flex: 1 }]}>
                            Recuerda presentarte con tu DNI en mano.
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={[styles.cardSectionTitle, { color: headerColor }]}>MÉDICO ESPECIALIZADO ASIGNADO</Text>
                    
                    <View style={styles.rowCenterTop}>
                        <View style={[styles.avatarContainer, { backgroundColor: lightBlueBg }]}>
                            <Ionicons name="person" size={30} color={primaryColor} />
                        </View>
                        <View style={styles.doctorInfo}>
                            <Text style={styles.boldText}>Dr. Carlos Mendoza</Text>
                            <Text style={styles.grayText}>Cardiólogo clínico</Text>
                            <View style={[styles.darkBadge, { backgroundColor: darkBlueBadge }]}>
                                <Text style={styles.badgeText}>CPM: 48291</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={[styles.cardSectionTitle, { color: headerColor }]}>ESTABLECIMIENTO DE SALUD</Text>
                    <Text style={[styles.boldText, { marginBottom: 10 }]}>
                        Hospital Nacional Edgardo Rebagliati Martins
                    </Text>

                    <Image 
                        source={{ uri: 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/e40b6ea6361a1abe28f32e7910f63b66/1-intro-photo-final.jpg?w=1200&h=992' }} 
                        style={styles.mapImage} 
                    />

                    <View style={styles.locationBoxes}>
                        <View style={[styles.locBox, { backgroundColor: lightBlueBg, borderColor: headerColor }]}>
                            <Text style={styles.locBoxTitle}>Pabellón</Text>
                            <Text style={[styles.locBoxValue, { color: primaryColor }]}>B</Text>
                        </View>
                        <View style={[styles.locBox, { backgroundColor: lightBlueBg, borderColor: headerColor }]}>
                            <Text style={styles.locBoxTitle}>Piso</Text>
                            <Text style={[styles.locBoxValue, { color: primaryColor }]}>2</Text>
                        </View>
                        <View style={[styles.locBox, { backgroundColor: lightBlueBg, borderColor: headerColor }]}>
                            <Text style={styles.locBoxTitle}>Consultorio</Text>
                            <Text style={[styles.locBoxValue, { color: primaryColor }]}>201</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.mapButton, { backgroundColor: primaryColor }]} onPress={openMap}>
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
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: 'white',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#cbd5e1',
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
        color: '#1e293b',
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
        color: '#1e293b',
    },
    subText: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
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
        color: '#94a3b8',
        fontSize: 13,
        marginTop: 2,
    },
    mapImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#e2e8f0',
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
        color: '#64748b',
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