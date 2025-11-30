import { useState, useEffect, useCallback } from 'react';
import { Advertisement, AdType, AdSize } from './types';
import { db, storage } from './firebase';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Backup Mock Data for Demo/Fallback if DB permissions fail
const INITIAL_ADS: Advertisement[] = [
  {
    id: '1',
    title: 'Neon Cyberpunk',
    type: AdType.IMAGE,
    url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070&auto=format&fit=crop',
    size: AdSize.BIG,
    createdAt: Date.now(),
    description: 'Experience the future today.'
  },
  {
    id: '2',
    title: 'New York Night',
    type: AdType.IMAGE,
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop',
    size: AdSize.PORTRAIT,
    createdAt: Date.now() - 1000,
    description: 'The city that never sleeps.'
  },
  {
    id: '3',
    title: 'Tech Promo',
    type: AdType.VIDEO,
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    size: AdSize.LANDSCAPE,
    createdAt: Date.now() - 2000,
    description: 'Visual fidelity test.'
  },
  {
    id: '4',
    title: 'Fashion Week',
    type: AdType.IMAGE,
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1976&auto=format&fit=crop',
    size: AdSize.SQUARE,
    createdAt: Date.now() - 3000,
  }
];

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
      console.error("Error fetching ads (Permission or Network issue):", error);
      // Fallback to demo data so the billboard isn't empty during setup
      console.log("Switching to Demo Mode due to error.");
      setAds(INITIAL_ADS);
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

  const updateAd = useCallback(async (id: string, updates: Partial<Advertisement>) => {
    try {
      const adRef = doc(db, "ads", id);
      await updateDoc(adRef, updates);
    } catch (e) {
      console.error("Error updating ad: ", e);
      throw e;
    }
  }, []);

  const removeAd = useCallback(async (id: string, url: string) => {
    try {
      await deleteDoc(doc(db, "ads", id));

      // Only attempt to delete if it's a firebase storage url
      if (url && url.includes("firebasestorage.googleapis.com")) {
         const fileRef = ref(storage, url);
         await deleteObject(fileRef).catch(err => console.log("File cleanup warning (check storage rules):", err));
      }
    } catch (e) {
      console.error("Error removing ad: ", e);
      throw e;
    }
  }, []);

  const uploadAdImage = useCallback(async (file: File): Promise<string> => {
    const storageRef = ref(storage, `ads/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }, []);

  return { ads, loading, addAd, updateAd, removeAd, uploadAdImage };
};