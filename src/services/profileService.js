import { supabase } from "../supabase/supabaseClient";

export const getProfile = async () => {
   const { data: { user }, error: authError } = await supabase.auth.getUser();

   if (authError) throw authError;
   if (!user) throw new Error("Usuario no autenticado");

   const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .eq("id", user.id)
      .single();

   if (error) throw error;

   return data;
};

export const updateProfileField = async (columnName, value) => {
   const { data: { user }, error: authError } = await supabase.auth.getUser();

   if (authError) throw authError;
   if (!user) throw new Error("Usuario no autenticado");

   const { data, error } = await supabase
      .from("pacientes")
      .update({ [columnName]: value })
      .eq("id", user.id)
      .select()
      .single();

   if (error) throw error;

   return data;
};