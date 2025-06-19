import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import { useAuthStore } from "../../store/authStore";
import styles from '@/assets/styles/profile.styles';

import ProfileHeader from '../../components/ProfileHeader';
import LogoutButton from '../../components/LogoutButton'
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';

import { Image } from 'expo-image';

export default function Profile() {

  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const { logOut, token } = useAuthStore();


  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("http://192.168.1.7:8000/api/books/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user books");
      }

      setBooks(data); // Make sure your backend sends an array here
    } catch (error) {
      console.log("Error fetching data: ", error.message);
    } finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    fetchData();
  }, []);

  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.image }} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
      </View>
      <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>
      <Text style={styles.bookCaption}>
        {item.caption}
      </Text>
    </View>
  )

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={20}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      )
    }
    return stars;
  }

  return (
    <View >
      <ProfileHeader />
      <LogoutButton />

      {/* Your Recomendations */}
      <View style={styles.booksHeader}>
        <Text style={styles.bookTitle}> Your Recomendations </Text>
        <Text style={styles.booksCount}>{books.length}</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name='book-outline' size={50} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No Recomendations yet</Text>

            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
              <Text style={styles.addButtonText}>Add Your First Book</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  )
}