import { supabase } from "../supabase/supabaseClient"

const TABLE = 'especialidades';

export const getSpecialties = async () => {
   const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('especialidad');
   
   if(error) throw error;

   return data ?? [];
}