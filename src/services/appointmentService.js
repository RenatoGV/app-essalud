import { supabase } from '../supabase/supabaseClient';
import { getDateInPeru } from '../helpers/Formatter';
import { getAvailableSlots, isFutureSlot } from './availabilityService';

const TABLE = 'citas';

const ACTIVE_STATES = ['pendiente', 'confirmada'];

/**
 * @typedef {Object} PatientAppointment
 * @property {string|number} id
 * @property {string|number} doctorId
 * @property {string} fecha
 * @property {string} hora
 * @property {string} estado
 * @property {string} doctor
 * @property {string[]} especialidades
 * @property {string} centroSalud
 */

// Compartido por el listado y la gestión de una cita individual.
const APPOINTMENT_FIELDS = `
   id, doctor, fecha, hora, estado,
   medico:doctor (
      nombres, apaterno, amaterno,
      consultorio (centro_medico (centro_medico)),
      doctor_especialidad (especialidad (especialidad))
   )
`;

export class AppointmentError extends Error {}

const getPatientId = async () => {
   const { data: { user }, error } = await supabase.auth.getUser();
   if (error) throw error;
   if (!user) throw new AppointmentError('Tu sesión ha terminado. Vuelve a iniciar sesión.');
   return user.id;
};

// Aísla las relaciones de Supabase del contrato que utiliza la interfaz. 
const mapAppointment = (appointment) => {
   const doctor = appointment.medico;
   const fullName = [doctor?.nombres, doctor?.apaterno, doctor?.amaterno]
      .filter(Boolean).join(' ').trim();
   const specialties = (doctor?.doctor_especialidad ?? [])
      .map((item) => item.especialidad?.especialidad)
      .filter(Boolean);

   return {
      id: appointment.id,
      doctorId: appointment.doctor,
      fecha: appointment.fecha,
      hora: appointment.hora,
      estado: appointment.estado,
      doctor: fullName || 'Médico no disponible',
      especialidades: [...new Set(specialties)].sort(),
      centroSalud: doctor?.consultorio?.centro_medico?.centro_medico || 'Centro de salud no disponible',
   };
};

//Lee las citas activas desde hoy del paciente autenticado, ordenadas por fecha y hora.
/** @param {{signal?: AbortSignal}} options */
export const getPatientAppointments = async ({ signal } = {}) => {
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   if (authError) throw authError;
   if (!user) throw new Error('No hay un paciente autenticado.');
   if (signal?.aborted) return [];

   // Relaciones opcionales: no ocultar la cita si falta información del médico o del centro.
   let query = supabase.from(TABLE).select(APPOINTMENT_FIELDS)
      .eq('paciente', user.id)
      .in('estado', ACTIVE_STATES)
      .gte('fecha', getDateInPeru())
      .order('fecha')
      .order('hora')
      .order('id');

   if (signal) query = query.abortSignal(signal);
   const { data, error } = await query;
   if (error) throw error;

   return (data ?? []).map(mapAppointment);
};

// La ruta solo transporta el ID; la propiedad y el estado se consultan de nuevo.
/** @param {string|number} id @param {{signal?: AbortSignal}} options */
export const getPatientAppointment = async (id, { signal } = {}) => {
   if (!id) throw new AppointmentError('No se ha seleccionado una cita.');
   const patientId = await getPatientId();
   let query = supabase.from(TABLE).select(APPOINTMENT_FIELDS)
      .eq('id', id).eq('paciente', patientId);
   if (signal) query = query.abortSignal(signal);
   const { data, error } = await query.maybeSingle();
   if (error) throw error;
   if (!data) throw new AppointmentError('La cita no está disponible para tu cuenta.');
   return mapAppointment(data);
};

/** @param {PatientAppointment} appointment */
export const canManageAppointment = (appointment) => Boolean(appointment &&
   ACTIVE_STATES.includes(appointment.estado) && isFutureSlot(appointment.fecha, appointment.hora));

// Conserva el registro original. Los filtros detectan cambios desde que se abrió la pantalla.
const updatePatientAppointment = async (appointment, changes) => {
   const patientId = await getPatientId();
   if (!canManageAppointment(appointment)) {
      throw new AppointmentError('Solo puedes modificar citas activas que aún no hayan comenzado.');
   }
   const { data, error } = await supabase.from(TABLE).update(changes)
      .eq('id', appointment.id).eq('paciente', patientId)
      .eq('doctor', appointment.doctorId).eq('estado', appointment.estado)
      .eq('fecha', appointment.fecha).eq('hora', appointment.hora)
      .select('id').maybeSingle();
   if (error) {
      if (error.code === '23505' || error.code === '23P01') {
         throw new AppointmentError('Este horario ya fue reservado. Selecciona otro horario.');
      }
      throw error;
   }
   if (!data) throw new AppointmentError('La cita cambió o ya no puedes modificarla. Vuelve a Mis citas y actualiza la lista.');
   return data;
};

/** @param {PatientAppointment} appointment */
export const cancelAppointment = (appointment) =>
   updatePatientAppointment(appointment, { estado: 'cancelada' });

/**
 * Mantiene médico y centro. La disponibilidad se vuelve a consultar antes del UPDATE.
 * La BD debe impedir duplicados de médico/fecha/hora activos para resolver reservas simultáneas.
 * @param {PatientAppointment} appointment
 * @param {{date: string, time: string}} selection
 */
export const rescheduleAppointment = async (appointment, { date, time }) => {
   await getPatientId();
   if (!canManageAppointment(appointment) || !isFutureSlot(date, time)) {
      throw new AppointmentError('Selecciona una fecha y hora futuras para una cita activa.');
   }
   if (date === appointment.fecha && time.slice(0, 5) === appointment.hora.slice(0, 5)) {
      throw new AppointmentError('Selecciona un horario diferente al de tu cita actual.');
   }
   const shift = Number(time.slice(0, 2)) < 14 ? 'manana' : 'tarde';
   const slots = await getAvailableSlots(appointment.doctorId, date, shift);
   if (!slots.some((slot) => slot.hora === time && !slot.ocupado) || !isFutureSlot(date, time)) {
      throw new AppointmentError('Este horario ya no está disponible. Consulta los horarios nuevamente.');
   }
   return updatePatientAppointment(appointment, { fecha: date, hora: time, estado: 'pendiente' });
};

export const createAppointment = async ({doctorId, date, time}) => {
   // Obtener el usuario autenticado
   const { data: { user }, error: authError } = await supabase.auth.getUser();

   if (authError) throw authError;

   if (!user) {
      throw new Error('No hay un paciente autenticado.');
   }

   // Registrar la cita
   const { data, error } = await supabase
      .from(TABLE)
      .insert({
         doctor: doctorId,
         paciente: user.id,
         fecha: date,
         hora: time,
         estado: 'pendiente',
      })
      .select()
      .single();

   if (error) throw error;

   return data;
};
