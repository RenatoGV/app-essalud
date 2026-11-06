import { supabase } from '../supabase/supabaseClient';

const TABLE = 'citas';

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