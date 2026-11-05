import { supabase } from "../supabase/supabaseClient"

const TABLE = 'centros_medico';

export const getMedicalCenters = async () => {
   const { data, error } = await supabase
      .from(TABLE)
      .select('*');
   
   if(error) throw error;

   return data ?? [];
}