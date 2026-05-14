import { FieldValue, Timestamp } from "firebase/firestore";

export interface PostType {
    id: string;
    title: string;
    description: string;
    location: string;
    image: string;
    type: 'lost' | 'found';
    status: 'open' | 'resolved';
    isHidden: boolean;
    isBanned: boolean;
    createdAt: Timestamp | FieldValue | any;
    userId: string;
    userName: string;
    userAvatar: string | null;
    provinceId: number | null;
    provinceName: string;
    wardId: number | null;
    wardName: string;
    geo: {
        lat: number;
        lng: number;
    } | null;
    time? : string;
}
export const EMPTY_POST: PostType = {
    id: '',
    title: '',
    description: '',
    location: '',
    image: '',
    type: 'lost',
    status: 'open',
    isHidden: false,
    isBanned: false,
    createdAt: null,
    userId: '',
    userName: 'Người dùng...',
    userAvatar: null,
    provinceId: null,
    provinceName: '',
    wardId: null,
    wardName: '',
    geo: null
};