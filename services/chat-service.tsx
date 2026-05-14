import { auth, db } from "@/configs/firebase-config";
import CryptoJS from 'crypto-js';
import { collection, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";

export const getOrCreatePrivateChat = async (targetUserId: string, targetUserName: string, targetUserAvatar: string | null) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Chưa đăng nhập");

    const roomIds = [currentUser.uid, targetUserId].sort();
    const roomId = `private_${roomIds[0]}_${roomIds[1]}`;
    const roomRef = doc(db, 'chatRooms', roomId);

    try {
        const roomSnap = await getDoc(roomRef);
        
        if (!roomSnap.exists()) {
            const roomSecretKey = CryptoJS.lib.WordArray.random(16).toString();

            await setDoc(roomRef, {
                type: 'private',
                participantIds: [currentUser.uid, targetUserId],
                participantsInfo: {
                    [currentUser.uid]: { name: currentUser.displayName, avatar: currentUser.photoURL },
                    [targetUserId]: { name: targetUserName, avatar: targetUserAvatar }
                },
                secretKey: roomSecretKey,
                updatedAt: serverTimestamp(),
                unreadCounts: {
                    [currentUser.uid]: 0,
                    [targetUserId]: 0
                }
            });
        }
        return roomId;
    } catch (error) {
        console.error("Lỗi khi tạo phòng chat:", error);
        throw error;
    }
};

export const sendMessage = async (roomId: string, text: string, receiverIds: string[], secretKey: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const encryptedText = CryptoJS.AES.encrypt(text, secretKey).toString();

    const batch = writeBatch(db);

    const messageRef = doc(collection(db, `chatRooms/${roomId}/messages`));
    batch.set(messageRef, {
        text: encryptedText,
        senderId: currentUser.uid,
        type: 'text',
        timestamp: serverTimestamp(),
        readBy: [currentUser.uid]
    });

    const roomRef = doc(db, 'chatRooms', roomId);
    
    const unreadUpdates: any = {};
    receiverIds.forEach(id => {
        if (id !== currentUser.uid) {
            unreadUpdates[`unreadCounts.${id}`] = increment(1);
        }
    });

    batch.update(roomRef, {
        lastMessage: {
            text: encryptedText,
            senderId: currentUser.uid,
            timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
        ...unreadUpdates
    });

    await batch.commit();
};

export const markRoomAsRead = async (roomId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const roomRef = doc(db, 'chatRooms', roomId);
    await updateDoc(roomRef, {
        [`unreadCounts.${currentUser.uid}`]: 0
    });
};