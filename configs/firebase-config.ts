import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
    apiKey: "AIzaSyDZMiXrbvld6TQ27v4nvNfucuqBnwm1BgI",
    authDomain: "fintit-44beb.firebaseapp.com",
    projectId: "fintit-44beb",
    storageBucket: "fintit-44beb.firebasestorage.app",
    messagingSenderId: "642517302555",
    appId: "1:642517302555:web:61dedb0bef73a603dfa7be",
    measurementId: "G-K6W7QQ0L5Q"
};

export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);
 

