import { useState, useEffect, useCallback } from 'react';
import { Advertisement, AdType, AdSize } from './types';
import { db, storage } from './firebase';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const useAds = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time updates from Firestore
    const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Advertisement[];
      setAds(fetchedAds);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching ads:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addAd = useCallback(async (ad: Omit<Advertisement, 'id'>) => {
    try {
      await addDoc(collection(db, "ads"), ad);
    } catch (e) {
      console.error("Error adding ad: ", e);
      throw e;
    }
  }, []);

  const removeAd = useCallback(async (id: string, url: string) => {
    try {
      // 1. Delete the document from Firestore
      await deleteDoc(doc(db, "ads", id));

      // 2. If it's a firebase storage image, delete the file too to save space
      if (url.includes("firebasestorage.googleapis.com")) {
         // Create a reference to the file to delete
         const fileRef = ref(storage, url);
         await deleteObject(fileRef).catch(err => console.log("File cleanup warning:", err));
      }
    } catch (e) {
      console.error("Error removing ad: ", e);
      throw e;
    }
  }, []);

  const uploadAdImage = useCallback(async (file: File): Promise<string> => {
    const storageRef = ref(storage, `ads/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  }, []);

  return { ads, loading, addAd, removeAd, uploadAdImage };
};