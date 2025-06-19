import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Image } from "expo-image";

import { useAuthStore } from "../../store/authStore";
import styles from '@/assets/styles/home.styles';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';

import { formatPublishDate } from '../../libs/utils'

export default function Home() {

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { logOut, token } = useAuthStore();

  const fetchBooks = async (pageNumber = 1, refresh = false) => {
    try {
      if (refreshing) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }

      const response = await fetch(`http://192.168.1.7:8000/api/books?page=${pageNumber}&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch books");
      }

      // setBooks((prevBooks) => [...prevBooks, ...data.books]);

      const uniqueBooks = refresh || pageNumber === 1
        ? data.books
        : Array.from(new Set([...books, ...data.books].map((books) => books._id))).map((id) =>
          [...books, ...data.books].find((book) => book._id === id));

      setBooks(uniqueBooks)

      setHasMore(pageNumber < data.totalPages);

      setPage(pageNumber);

    } catch (error) {
      console.log("Error fetching books", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchBooks(page + 1);
    }
  }

  const renderItem = ({ item }) => (
    < View style={styles.bookCard} >
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image source={item.user.profileImage} style={styles.avatar} />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>
      <View style={styles.bookImageContainer}>
        <Image source={item.image} style={styles.bookImage} contentFit="cover" />
      </View>

      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>Shared on: {formatPublishDate(item.createdAt)}</Text>
      </View>
    </View >
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

  useEffect(() => {
    fetchBooks();
  }, [])

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}

        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🐝BookWorm🐝</Text>
            <Text style={styles.headerSubtitle}>Discover great reads from the community</Text>
          </View>
        }

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name='book-outline' size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No Recomendations</Text>
            <Text style={styles.emptySubtext}>Be the first to share a book!</Text>
          </View>
        }

        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}

        refreshControl={
          <RefreshControl
          refreshing={refreshing}
          onRefresh={()=>fetchBooks(1, true)}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
          />
        }

        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
        }
      />

    </View>
  )
}