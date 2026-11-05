import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { getSpecialties } from "../services/specialtyService";

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
   const [specialties, setSpecialties] = useState([]);

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const loadedRef = useRef(false);
   const loadingRef = useRef(false);

   const loadAppData = useCallback(async (force = false) => {
      if (loadingRef.current) return;
      if (loadedRef.current && !force) return;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
         const [specialtiesData] = await Promise.all([
            getSpecialties()
         ]);
         
         setSpecialties(specialtiesData);

         loadedRef.current = true;
      } catch (e) {
         console.error("Error loading application data:", e);
         setError(e);
         throw e;
      } finally {
         loadingRef.current = false;
         setLoading(false);
      }
   }, []);


   const refreshSpecialties = useCallback(async () => {
      const data = await getSpecialties();
      setSpecialties(data);
      return data;
   }, []);

   const clearAppData = useCallback(() => {
      setSpecialties([]);
      setError(null);

      loadedRef.current = false;
      loadingRef.current = false;
   }, []);

   const value = useMemo(
      () => ({ specialties, loading, error, loadAppData, refreshSpecialties, clearAppData }),
      [specialties, loading, loadAppData]
   );

   return (
      <AppDataContext.Provider value={value}>
         {children}
      </AppDataContext.Provider>
   );
};

export const useAppData = () => {
   const context = useContext(AppDataContext);

   if (!context) {
      throw new Error("useAppData must be used within AppDataProvider");
   }

   return context;
};