import { storage } from "@/configs/firebase-config";
import CryptoJS from 'crypto-js';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";


export const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Vừa xong';

    const date = timestamp.toDate();
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
    return Math.floor(diff / 86400) + ' ngày trước';
};

export const normalizeLocation = (text: string | null) => {
    if (!text) return "";
    return text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/(tỉnh|thành phố|thành phô|quận|huyện|thị xã|phường|xã|thị trấn|tp|tx|tt)\.?\s+/g, '')
        .replace(/đ/g, "d").trim();
};

export const isMatchLocation = (name1?: string, name2?: string) => {
    if (!name1 || !name2) return false;
    const normName1 = normalizeLocation(name1);
    const normName2 = normalizeLocation(name2);

    if (normName1 === normName2) return true;

    if (!isNaN(Number(normName1)) || !isNaN(Number(normName2))) return false;
    return normName1.includes(normName2) || normName2.includes(normName1);
};

export const uploadImage = async (image:string, folder:string) => {
    try {
        const response = await fetch(image);
        const blob = await response.blob();

        const filename = folder + '/' + Date.now() + '-' + Math.random().toString(36).substring(7) + '.jpg';
        const storageRef = ref(storage, filename);

        await uploadBytes(storageRef, blob);

        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    } catch (error) {
        console.log("Có lỗi khi upload ảnh: ", error);
        throw error;
    }
}

export const decryptMessage = (cipherText: string, secretKey: string) => {
    if (!cipherText || !secretKey) return "";
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        
        return originalText || "Tin nhắn không thể giải mã"; 
    } catch (error) {
        return "Lỗi giải mã";
    }
};


