import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function useHideBottomBar() {
  useEffect(()=>{
    if(Platform.OS != 'android') return;

    const toggleBottomBar = async () => {
        try {
            await NavigationBar.setVisibilityAsync('hidden');
            await NavigationBar.setBehaviorAsync('inset-touch')
        }catch(error){
            console.warn('Lỗi khi thiết lập thanh điều hướng: ', error);
        }
    }
    toggleBottomBar();
  })
}