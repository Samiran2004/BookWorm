import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,

    register: async (username, email, password) => {
        set({ isLoading: true })
        try {
            const response = await fetch("http://192.168.1.7:8000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            })

            const data = await response.json();
            // console.log(data);

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }
            // Save token and user to AsyncStorage
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));

            set({ token: data.token, user: data.user, isLoading: false });

            return { success: true }
        } catch (error) {
            set({ isLoading: false });
            return { success: false, error: error.message }
        }
    },

    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userJson = await AsyncStorage.getItem("user");
            const user = userJson ? JSON.parse(userJson) : null;
            set({ token, user });
        } catch (error) {
            console.log("Auth check failed.", error.message);
        }
    },

    logOut: async () => {
        try {
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("token");
            set({ token: null, user: null });
        } catch (error) {
            console.log("Logout error: ", error.message);
        }
    },

    login: async (email, password) => {
        console.log(email);
        console.log(password);
        set({ isLoading: true });
        try {
            const response = await fetch("http://192.168.1.7:8000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong.");
            }

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);

            set({user: data.user, token: data.token, isLoading: false});
        } catch (error) {
            set({ isLoading: false });
            console.log("Login error: ", error.message);
        }
    }

}))