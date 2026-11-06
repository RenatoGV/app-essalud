import { supabase } from "../supabase/supabaseClient";

const TABLE = 'doctores';

export const getDoctorsByMedicalCenterAndSpecialty = async (medicalCenterId, specialtyId) => {
   const { data, error } = await supabase
      .from(TABLE)
      .select(`
         id,
         nombres,
         apaterno,
         amaterno,
         cmp,
         consultorio!inner (
            id,
            numero,
            piso,
            pabellon,
            centro_medico
         ),
         doctor_especialidad!inner (
            especialidad!inner (
               id,
               especialidad
            )
         )
      `)
      .eq("consultorio.centro_medico", medicalCenterId)
      .eq("doctor_especialidad.especialidad.id", specialtyId)
      .order("nombres");

   if (error) throw error;

   return data ?? [];
};