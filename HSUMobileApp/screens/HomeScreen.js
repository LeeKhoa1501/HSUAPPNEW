import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// const features = [
//   { id: 1, name: 'Chuyên cần', icon: 'user-check' },
//   { id: 2, name: 'Đánh giá môn học', icon: 'bar-chart' },
//   { id: 3, name: 'Đặt phòng', icon: 'building' },
//   { id: 4, name: 'Điểm', icon: 'check-circle' },
//   { id: 5, name: 'Điểm danh', icon: 'map-marker' },
//   { id: 6, name: 'Học phí', icon: 'money' },
//   { id: 7, name: 'Kế hoạch HTCN', icon: 'calendar' },
//   { id: 8, name: 'Khảo sát CVHT', icon: 'file-text' },
//   { id: 9, name: 'Khảo sát dịch vụ', icon: 'clipboard' },
//   { id: 10, name: 'Lịch thi', icon: 'calendar-check' },
//   { id: 11, name: 'Góp ý sinh viên', icon: 'comments' },
//   { id: 12, name: 'Sổ tay sinh viên', icon: 'book' },
// ];

const HomeScreen = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch("http://10.101.38.182:5055/api/home/icons");
        const data = await response.json();
        console.log("📥 MENU DATA:", data);
        setMenu(data);
      } catch (error) {
        console.log("❌ Lỗi fetch home:", error.message);
        Alert.alert("Lỗi", "Không thể kết nối đến API. Vui lòng kiểm tra IP hoặc server.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <FontAwesome name={item.Icon || "question"} size={24} color={item.IconColor || "#000"} />
      </View>
      <Text style={styles.label}>{item.Name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📋 Menu chính</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#000080" />
      ) : (
        <FlatList
          data={menu}
          numColumns={2}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#f4f4f4',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    flex: 0.48,
  },
  iconCircle: {
    backgroundColor: '#eee',
    padding: 16,
    borderRadius: 40,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});


export default HomeScreen;
