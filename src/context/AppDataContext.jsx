import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { getSpecialties } from "../services/specialtyService";
import { getMedicalCenters } from "../services/medicalCenterService";
import { getProfile, updateProfileField } from "../services/profileService";

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
   const [specialties, setSpecialties] = useState([]);
   const [medicalCenters, setMedicalCenters] = useState([]);

   const [profile, setProfile] = useState(null);

   const [loading, setLoading] = useState(true);
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
         const [specialtiesData, medicalCentersData, profileData] = await Promise.all([
            getSpecialties(),
            getMedicalCenters(),
            getProfile()
         ]);
         
         setSpecialties(specialtiesData);
         setMedicalCenters(medicalCentersData);
         setProfile(profileData);

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

   const refreshMedicalCenters = useCallback(async () => {
      const data = await getMedicalCenters();
      setMedicalCenters(data);
      return data;
   }, []);
   
   const updateProfile = useCallback(async (column, value) => {
      const updatedData = await updateProfileField(column, value);

      setProfile(prev => ({ ...prev, ...updatedData }));

      return updatedData;
   }, []);

   const clearAppData = useCallback(() => {
      setSpecialties([]);
      setMedicalCenters([]);
      setProfile(null);
      setError(null);

      loadedRef.current = false;
      loadingRef.current = false;
   }, []);

   const value = useMemo(
      () => ({ specialties, medicalCenters, profile, loading, error, loadAppData, refreshSpecialties, refreshMedicalCenters, updateProfile, clearAppData }),
      [specialties, medicalCenters, profile, loading, error, loadAppData, refreshSpecialties, refreshMedicalCenters, updateProfile, clearAppData]
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