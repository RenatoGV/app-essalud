import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator, Image,
    Linking, RefreshControl,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/styles';
import { supabase } from '../supabase/supabaseClient';
import { useAppData } from '../context/AppDataContext';

const TABLE = 'citas';
const CACHE_KEY_PREFIX = '@essalud_citas_cache_';

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const STATUS_META = {
    pendiente: { label: 'Pendiente', bg: '#FEF3C7', text: '#92400E' },
    confirmada: { label: 'Confirmada', bg: '#DCFCE7', text: '#166534' },
    completada: { label: 'Completada', bg: '#DBEAFE', text: '#1E40AF' },
    cancelada: { label: 'Cancelada', bg: '#FEE2E2', text: '#991B1B' },
};

const isNetworkError = (err) => {
    const msg = String(err?.message || '').toLowerCase();
    return (
        err?.name === 'AuthRetryableFetchError' ||
        msg.includes('network') ||
        msg.includes('fetch') ||
        msg.includes('timeout') ||
        msg.includes('offline')
    );
};

const parseLocalDate = (dateValue) => {
    if (!dateValue) return null;
    if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
        return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
    }
    const str = String(dateValue).trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]) - 1;
        const day = Number(match[3]);
        const parsed = new Date(year, month, day);
        if (
            parsed.getFullYear() === year &&
            parsed.getMonth() === month &&
            parsed.getDate() === day
        ) {
            return parsed;
        }
        return null;
    }
    const fallback = new Date(str);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const formatDateLong = (dateValue) => {
    const date = parseLocalDate(dateValue);
    if (!date) return 'Fecha por confirmar';
    return `${DAYS_ES[date.getDay()]}, ${date.getDate()} de ${MONTHS_ES[date.getMonth()]} del ${date.getFullYear()}`;
};

const formatTimeDisplay = (timeValue) => {
    if (!timeValue) return '--:--';
    const raw = String(timeValue).trim();
    if (/a\.?\s*m\.?|p\.?\s*m\.?/i.test(raw)) return raw;
    const match = raw.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return raw;
    let hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
};

const getShiftLabel = (timeValue) => {
    if (!timeValue) return 'Turno asignado';
    const raw = String(timeValue).trim().toLowerCase();
    const match = raw.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return 'Turno asignado';
    let hours = Number(match[1]);
    if (raw.includes('p.m') && hours < 12) hours += 12;
    if (raw.includes('a.m') && hours === 12) hours = 0;
    if (hours < 12) return 'Turno mañana';
    if (hours < 18) return 'Turno tarde';
    return 'Turno noche';
};

const getDaysRemainingLabel = (dateValue) => {
    const target = parseLocalDate(dateValue);
    if (!target) return 'Sin fecha';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays > 1) return `En ${diffDays} días`;
    return `Hace ${Math.abs(diffDays)} día(s)`;
};

const maskSensitiveData = (value, visibleDigits = 4) => {
    if (!value) return 'No registrado';
    const clean = String(value).trim();
    if (clean.length <= visibleDigits) return '****';
    return `${'•'.repeat(Math.min(clean.length - visibleDigits, 6))}${clean.slice(-visibleDigits)}`;
};

export default function AppointmentDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { profile, medicalCenters, specialties } = useAppData();

    const routeCitaId = route.params?.citaId ?? route.params?.id ?? route.params?.cita?.id ?? null;

    const [sessionUser, setSessionUser] = useState(null);
    const [sessionValid, setSessionValid] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(routeCitaId);
    const [statusFilter, setStatusFilter] = useState('todas');
    const [usingCache, setUsingCache] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Guardar caché local de forma segura (Módulo 3.4 - AsyncStorage)
    const saveAppointmentsCache = useCallback(async (userId, list) => {
        try {
            await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(list));
        } catch (cacheErr) {
            console.warn('No se pudo actualizar la caché local:', cacheErr);
        }
    }, []);

    // Consulta híbrida: Supabase (API REST) + fallback a AsyncStorage (Módulos 3.2, 3.3, 3.4 y 3.5)
    const fetchAppointments = useCallback(
        async (isPullRefresh = false) => {
            if (isPullRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setErrorMessage(null);

            let localUser = null;

            try {
                // 1. Verificar sesión local persistida en AsyncStorage por supabaseClient
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                localUser = sessionData?.session?.user ?? null;

                if (sessionError || !localUser) {
                    setSessionUser(null);
                    setSessionValid(false);
                    setAppointments([]);
                    return;
                }

                // 2. Validar sesión contra el servidor
                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    if (!isNetworkError(userError)) {
                        setSessionUser(null);
                        setSessionValid(false);
                        setAppointments([]);
                        return;
                    }
                    throw userError;
                }

                const verifiedUser = userData?.user;
                if (!verifiedUser) {
                    setSessionUser(null);
                    setSessionValid(false);
                    setAppointments([]);
                    return;
                }

                setSessionUser(verifiedUser);
                setSessionValid(true);

                // 3. Consultar citas del paciente autenticado en Supabase
                const { data, error } = await supabase
                    .from(TABLE)
                    .select('*')
                    .eq('paciente', verifiedUser.id)
                    .order('fecha', { ascending: true })
                    .order('hora', { ascending: true });

                if (error) throw error;

                const list = data || [];
                setAppointments(list);
                setUsingCache(false);

                await saveAppointmentsCache(verifiedUser.id, list);

                setSelectedAppointmentId((prevId) => {
                    const desiredId = routeCitaId ?? prevId;
                    if (desiredId && list.some((item) => String(item.id) === String(desiredId))) {
                        return desiredId;
                    }
                    const nextActive = list.find(
                        (item) => String(item.estado || '').toLowerCase() !== 'cancelada'
                    );
                    return (nextActive || list[0])?.id ?? null;
                });
            } catch (err) {
                console.error('Error al consultar citas:', err);

                // Fallback offline a caché local en AsyncStorage
                if (localUser) {
                    try {
                        const cachedRaw = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${localUser.id}`);
                        if (cachedRaw) {
                            const cachedList = JSON.parse(cachedRaw);
                            setSessionUser(localUser);
                            setSessionValid(true);
                            setAppointments(cachedList);
                            setSelectedAppointmentId((prevId) => {
                                const desiredId = routeCitaId ?? prevId;
                                if (desiredId && cachedList.some((item) => String(item.id) === String(desiredId))) {
                                    return desiredId;
                                }
                                return cachedList[0]?.id ?? null;
                            });
                            setUsingCache(true);
                            return;
                        }
                    } catch (cacheReadErr) {
                        console.warn('Error leyendo caché local:', cacheReadErr);
                    }
                }

                setErrorMessage('No se pudo cargar el detalle de la cita. Verifica tu conexión.');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [routeCitaId, saveAppointmentsCache]
    );

    useEffect(() => {
        fetchAppointments(false);
    }, [fetchAppointments]);

    // Estadísticas y filtros interactivos (Módulo 3.5 - Reportes / Consultas)
    const stats = useMemo(() => {
        return appointments.reduce(
            (acc, item) => {
                const status = String(item.estado || 'pendiente').toLowerCase();
                acc.total += 1;
                if (status === 'pendiente' || status === 'confirmada') acc.activas += 1;
                if (status === 'cancelada') acc.canceladas += 1;
                return acc;
            },
            { total: 0, activas: 0, canceladas: 0 }
        );
    }, [appointments]);

    const filteredAppointments = useMemo(() => {
        if (statusFilter === 'activas') {
            return appointments.filter((item) => {
                const status = String(item.estado || 'pendiente').toLowerCase();
                return status === 'pendiente' || status === 'confirmada';
            });
        }
        if (statusFilter === 'canceladas') {
            return appointments.filter(
                (item) => String(item.estado || '').toLowerCase() === 'cancelada'
            );
        }
        return appointments;
    }, [appointments, statusFilter]);

    const currentAppointment = useMemo(() => {
        const sourceList = filteredAppointments.length > 0 ? filteredAppointments : appointments;
        if (!sourceList.length) return null;
        return (
            sourceList.find((item) => String(item.id) === String(selectedAppointmentId)) ||
            sourceList[0]
        );
    }, [appointments, filteredAppointments, selectedAppointmentId]);

    const handleFilterChange = (nextFilter) => {
        setStatusFilter(nextFilter);
        const matching = appointments.filter((item) => {
            const status = String(item.estado || 'pendiente').toLowerCase();
            if (nextFilter === 'activas') return status === 'pendiente' || status === 'confirmada';
            if (nextFilter === 'canceladas') return status === 'cancelada';
            return true;
        });
        if (matching.length > 0 && !matching.some((item) => String(item.id) === String(selectedAppointmentId))) {
            setSelectedAppointmentId(matching[0].id);
        }
    };

    // Control de permisos y reglas de negocio (Módulos 3.1, 3.2 y 3.3)
    const userRole = profile?.rol || sessionUser?.user_metadata?.rol || 'paciente';
    const isOwner = Boolean(
        sessionUser &&
        currentAppointment &&
        String(currentAppointment.paciente) === String(sessionUser.id)
    );
    const normalizedStatus = String(currentAppointment?.estado || 'pendiente').toLowerCase();
    const statusStyle = STATUS_META[normalizedStatus] || STATUS_META.pendiente;

    // Enriquecimiento de campos con datos de ruta o contexto global
    const routeCita = route.params?.cita || null;

    const specialtyName = useMemo(() => {
        if (routeCita?.especialidad) return routeCita.especialidad;
        if (currentAppointment?.especialidad) return currentAppointment.especialidad;
        const found = specialties?.find(
            (s) => String(s.id) === String(currentAppointment?.especialidad_id)
        );
        return found?.nombre || found?.name || 'Medicina General / Especialidad asignada';
    }, [routeCita, currentAppointment, specialties]);

    const medicalCenterObj = useMemo(() => {
        if (!medicalCenters?.length) return null;
        return (
            medicalCenters.find(
                (c) =>
                    String(c.id) === String(currentAppointment?.centro_salud_id) ||
                    c.nombre === routeCita?.centroSalud
            ) || medicalCenters[0]
        );
    }, [medicalCenters, currentAppointment, routeCita]);

    const medicalCenterName =
        routeCita?.centroSalud ||
        currentAppointment?.centro_salud ||
        medicalCenterObj?.nombre ||
        medicalCenterObj?.name ||
        'Hospital Nacional Edgardo Rebagliati Martins';

    const doctorDisplayName =
        routeCita?.doctor ||
        currentAppointment?.doctor_nombre ||
        (currentAppointment?.doctor
            ? `Médico asignado (ID: ${maskSensitiveData(currentAppointment.doctor, 4)})`
            : 'Médico especialista asignado');

    const doctorCmp = currentAppointment?.cmp || routeCita?.cmp || 'Registrado en EsSalud';
    const pabellon = currentAppointment?.pabellon || medicalCenterObj?.pabellon || 'B';
    const piso = currentAppointment?.piso || medicalCenterObj?.piso || '2';
    const consultorio = currentAppointment?.consultorio || medicalCenterObj?.consultorio || '201';

    const openMap = () => {
        const lat = medicalCenterObj?.latitud ?? medicalCenterObj?.latitude;
        const lng = medicalCenterObj?.longitud ?? medicalCenterObj?.longitude;

        if (lat && lng) {
            void Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
            return;
        }

        const query = encodeURIComponent(medicalCenterObj?.direccion || medicalCenterName);
        void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.helperText}>Validando sesión y cargando detalle...</Text>
            </SafeAreaView>
        );
    }

    if (!sessionValid) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Ionicons name="shield-outline" size={48} color={colors.primary} />
                <Text style={styles.emptyTitle}>Sesión no autorizada</Text>
                <Text style={styles.helperText}>
                    Inicia sesión nuevamente para consultar o gestionar el detalle de tus citas.
                </Text>
                <TouchableOpacity
                    style={[styles.primaryButton, { marginTop: 16 }]}
                    onPress={() => (navigation.canGoBack() ? navigation.goBack() : null)}
                >
                    <Text style={styles.primaryButtonText}>Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (errorMessage) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Ionicons name="cloud-offline-outline" size={48} color={colors.primary} />
                <Text style={styles.emptyTitle}>Error de consulta</Text>
                <Text style={styles.helperText}>{errorMessage}</Text>
                <TouchableOpacity
                    style={[styles.primaryButton, { marginTop: 16 }]}
                    onPress={() => fetchAppointments(false)}
                >
                    <Text style={styles.primaryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!currentAppointment) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Ionicons name="calendar-outline" size={48} color={colors.primary} />
                <Text style={styles.emptyTitle}>No se encontraron citas</Text>
                <Text style={styles.helperText}>
                    Aún no tienes citas registradas para mostrar en el detalle.
                </Text>
                <TouchableOpacity
                    style={[styles.primaryButton, { marginTop: 16 }]}
                    onPress={() => fetchAppointments(false)}
                >
                    <Text style={styles.primaryButtonText}>Actualizar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchAppointments(true)}
                        colors={[colors.primary]}
                    />
                }
            >
                {/* Módulo 3.5: Resumen estadístico, filtros interactivos y selector de citas */}
                <View style={styles.card}>
                    <View style={styles.headerBetween}>
                        <Text style={[styles.cardSectionTitle, { color: colors.primary, marginBottom: 0 }]}>
                            RESUMEN DE TUS CITAS
                        </Text>
                        <View
                            style={[
                                styles.securityPill,
                                usingCache && { backgroundColor: '#FEF3C7' },
                            ]}
                        >
                            <Ionicons
                                name={usingCache ? 'cloud-offline-outline' : 'lock-closed'}
                                size={12}
                                color={usingCache ? '#92400E' : colors.primary}
                            />
                            <Text
                                style={[
                                    styles.securityPillText,
                                    usingCache && { color: '#92400E' },
                                ]}
                            >
                                {usingCache ? 'Modo offline (caché)' : 'Sesión verificada'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <TouchableOpacity
                            style={[
                                styles.statBox,
                                statusFilter === 'todas' && { borderColor: colors.primary, borderWidth: 1.5 },
                            ]}
                            onPress={() => handleFilterChange('todas')}
                        >
                            <Text style={styles.statValue}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.statBox,
                                statusFilter === 'activas' && { borderColor: colors.primary, borderWidth: 1.5 },
                            ]}
                            onPress={() => handleFilterChange('activas')}
                        >
                            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.activas}</Text>
                            <Text style={styles.statLabel}>Activas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.statBox,
                                statusFilter === 'canceladas' && { borderColor: '#DC2626', borderWidth: 1.5 },
                            ]}
                            onPress={() => handleFilterChange('canceladas')}
                        >
                            <Text style={[styles.statValue, { color: '#DC2626' }]}>{stats.canceladas}</Text>
                            <Text style={styles.statLabel}>Canceladas</Text>
                        </TouchableOpacity>
                    </View>

                    {filteredAppointments.length === 0 ? (
                        <Text style={styles.filterEmptyText}>
                            No hay citas en el filtro seleccionado. Toca "Total" para ver todas.
                        </Text>
                    ) : filteredAppointments.length > 1 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.selectorRow}
                        >
                            {filteredAppointments.map((item, idx) => {
                                const active = String(item.id) === String(currentAppointment.id);
                                return (
                                    <TouchableOpacity
                                        key={String(item.id)}
                                        style={[
                                            styles.selectorChip,
                                            active && { backgroundColor: colors.primary, borderColor: colors.primary },
                                        ]}
                                        onPress={() => setSelectedAppointmentId(item.id)}
                                    >
                                        <Text style={[styles.selectorChipText, active && { color: 'white' }]}>
                                            Cita #{idx + 1} · {String(item.fecha || '').slice(5, 10)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    ) : null}
                </View>

                {/* Especialidad, fecha, hora y estado */}
                <View style={styles.card}>
                    <View style={styles.headerBetween}>
                        <Text style={[styles.cardSectionTitle, { color: colors.primary, marginBottom: 0 }]}>
                            ESPECIALIDAD
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                                {statusStyle.label}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.mainTitle}>{specialtyName}</Text>

                    <View style={[styles.infoBox, { backgroundColor: colors.softBackground, borderColor: colors.primary }]}>
                        <MaterialIcons name="calendar-today" size={24} color={colors.primary} />
                        <View style={styles.infoBoxTextContainer}>
                            <Text style={styles.boldText}>{formatDateLong(currentAppointment.fecha)}</Text>
                            <View style={styles.rowCenter}>
                                <Text style={styles.subText}>{formatTimeDisplay(currentAppointment.hora)}</Text>
                                <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                                    <Text style={styles.badgeText}>{getShiftLabel(currentAppointment.hora)}</Text>
                                </View>
                            </View>
                            <Text style={styles.daysRemainingText}>
                                {getDaysRemainingLabel(currentAppointment.fecha)}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.infoBox, { backgroundColor: colors.softBackground, borderColor: colors.primary, marginTop: 10 }]}>
                        <MaterialCommunityIcons name="bell" size={24} color={colors.primary} />
                        <Text style={[styles.infoText, { marginLeft: 10, flex: 1 }]}>
                            Recuerda presentarte 30 minutos antes con tu DNI en mano.
                        </Text>
                    </View>
                </View>

                {/* Módulo 3.1 y 3.2: Datos del titular con enmascaramiento y permisos */}
                <View style={styles.card}>
                    <Text style={[styles.cardSectionTitle, { color: colors.primary }]}>
                        TITULAR DE LA CITA (DATOS PROTEGIDOS)
                    </Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Paciente:</Text>
                        <Text style={styles.metaValue}>
                            {profile?.nombre || profile?.nombres || sessionUser?.email || 'Usuario autenticado'}
                        </Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>DNI:</Text>
                        <Text style={styles.metaValue}>{maskSensitiveData(profile?.dni, 3)}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Código de cita:</Text>
                        <Text style={styles.metaValue}>{maskSensitiveData(currentAppointment.id, 6)}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Rol / Permiso:</Text>
                        <Text style={styles.metaValue}>
                            {String(userRole).toUpperCase()} · {isOwner ? 'Titular autorizado' : 'Solo lectura'}
                        </Text>
                    </View>
                </View>

                {/* Médico asignado */}
                <View style={styles.card}>
                    <Text style={[styles.cardSectionTitle, { color: colors.primary }]}>
                        MÉDICO ESPECIALIZADO ASIGNADO
                    </Text>

                    <View style={styles.rowCenterTop}>
                        <View style={[styles.avatarContainer, { backgroundColor: colors.softBackground }]}>
                            <Ionicons name="person" size={30} color={colors.primary} />
                        </View>
                        <View style={styles.doctorInfo}>
                            <Text style={styles.boldText}>{doctorDisplayName}</Text>
                            <Text style={styles.grayText}>{specialtyName}</Text>
                            <View style={[styles.darkBadge, { backgroundColor: colors.secondary }]}>
                                <Text style={styles.badgeText}>CMP: {doctorCmp}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Establecimiento de salud */}
                <View style={styles.card}>
                    <Text style={[styles.cardSectionTitle, { color: colors.primary }]}>
                        ESTABLECIMIENTO DE SALUD
                    </Text>
                    <Text style={[styles.boldText, { marginBottom: 10 }]}>{medicalCenterName}</Text>

                    <Image
                        source={require('../../assets/map-image.jpg')}
                        style={styles.mapImage}
                    />

                    <View style={styles.locationBoxes}>
                        <View style={[styles.locBox, { backgroundColor: colors.softBackground, borderColor: colors.primary }]}>
                            <Text style={styles.locBoxTitle}>Pabellón</Text>
                            <Text style={[styles.locBoxValue, { color: colors.primary }]}>{pabellon}</Text>
                        </View>
                        <View style={[styles.locBox, { backgroundColor: colors.softBackground, borderColor: colors.primary }]}>
                            <Text style={styles.locBoxTitle}>Piso</Text>
                            <Text style={[styles.locBoxValue, { color: colors.primary }]}>{piso}</Text>
                        </View>
                        <View style={[styles.locBox, { backgroundColor: colors.softBackground, borderColor: colors.primary }]}>
                            <Text style={styles.locBoxTitle}>Consultorio</Text>
                            <Text style={[styles.locBoxValue, { color: colors.primary }]}>{consultorio}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.mapButton, { backgroundColor: colors.primary }]}
                        onPress={openMap}
                    >
                        <Ionicons name="location-sharp" size={20} color="white" />
                        <Text style={styles.mapButtonText}>Cómo llegar (Google Maps)</Text>
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
    centerContainer: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
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
    headerBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
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
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    securityPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.softBackground,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    securityPillText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.primary,
        marginLeft: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: colors.softBackground,
        borderRadius: 8,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 11,
        color: colors.muted || '#6B7280',
        marginTop: 2,
    },
    filterEmptyText: {
        fontSize: 12,
        color: colors.muted || '#6B7280',
        marginTop: 10,
        textAlign: 'center',
    },
    selectorRow: {
        paddingTop: 12,
        gap: 8,
    },
    selectorChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.input,
        backgroundColor: 'white',
    },
    selectorChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
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
        flex: 1,
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
    daysRemainingText: {
        fontSize: 12,
        color: colors.muted || '#6B7280',
        marginTop: 4,
    },
    infoText: {
        color: colors.muted || colors.input,
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
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    metaLabel: {
        fontSize: 13,
        color: colors.muted || '#6B7280',
    },
    metaValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
        flexShrink: 1,
        textAlign: 'right',
        marginLeft: 12,
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
        flex: 1,
    },
    grayText: {
        color: colors.muted || colors.input,
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
        color: colors.muted || colors.input,
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
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 6,
        textAlign: 'center',
    },
    helperText: {
        fontSize: 14,
        color: colors.muted || '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 8,
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
