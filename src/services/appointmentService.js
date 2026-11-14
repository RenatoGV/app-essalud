import { supabase } from '../supabase/supabaseClient';
import { getDateInPeru } from '../helpers/Formatter';

const TABLE = 'citas';

const ACTIVE_STATES = ['pendiente', 'confirmada'];

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
      fecha: appointment.fecha,
      hora: appointment.hora,
      estado: appointment.estado,
      doctor: fullName || 'Médico no disponible',
      especialidades: [...new Set(specialties)].sort(),
      centroSalud: doctor?.consultorio?.centro_medico?.centro_medico || 'Centro de salud no disponible',
   };
};

//Lee las citas activas desde hoy del paciente autenticado, ordenadas por fecha y hora.
export const getPatientAppointments = async ({ signal } = {}) => {
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   if (authError) throw authError;
   if (!user) throw new Error('No hay un paciente autenticado.');
   if (signal?.aborted) return [];

   // Relaciones opcionales: no ocultar la cita si falta información del médico o del centro.
   let query = supabase.from(TABLE).select(`
      id, fecha, hora, estado,
      medico:doctor (
         nombres, apaterno, amaterno,
         consultorio (
            centro_medico (centro_medico)
         ),
         doctor_especialidad (
            especialidad (especialidad)
         )
      )
   `)
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
