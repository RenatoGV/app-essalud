import { supabase } from "../supabase/supabaseClient";

export const getMedicalHistory = async () => {
   const { data: { user }, error: authError } = await supabase.auth.getUser();

   if (authError) throw authError;
   if (!user) throw new Error("Usuario no autenticado");

   const { data, error } = await supabase
      .from("historial_medico")
      .select(`
         id,
         fecha,
         hora,
         consultorio_numero,
         consultorio_piso,
         consultorio_pabellon,
         centro_medico,
         doctor:doctores (
            nombres,
            apaterno,
            amaterno,
            doctor_especialidad (
               especialidad:especialidades (especialidad)
            )
         )
      `)
      .eq("paciente", user.id)
      .order("fecha", { ascending: false })
      .order("hora", { ascending: false });

   if (error) throw error;

   return data ?? [];
};
