import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React from 'react'

import { useAuthStore } from "../../mobile/store/authStore";
import styles from '@/assets/styles/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';

export default function LogoutButton() {

    const { logOut } = useAuthStore();

    const confirmLogOut = () => {
        Alert.alert("Logout", "Are you sure want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", onPress: () => logOut(), style: "destructive" }
        ]);
    }

    return (
        <TouchableOpacity onPress={confirmLogOut} style={styles.logoutButton}>
            <Ionicons name='log-out-outline' size={20} color={COLORS.white} />
            <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
    )
}