import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import homeData from '../assets/data/homeData.json';
import { Dimensions } from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;
const itemSize = (screenWidth - 64) / 4;

const HomeScreen = ({ navigation }) => {
  const [groupedFunctions, setGroupedFunctions] = useState({});

  useEffect(() => {
    const grouped = {
      'Thông tin học vụ': homeData.functions.filter(f => [1, 2, 3, 4, 5, 6, 7, 10, 16, 17, 18].includes(f.id)),
      'Khảo sát & Dịch vụ': homeData.functions.filter(f => [8, 9, 11, 12, 14, 15].includes(f.id)),
      'Sự kiện & Khác': homeData.functions.filter(f => [13].includes(f.id))
    };
    setGroupedFunctions(grouped);
  }, []);

  const handleFunctionPress = (item) => {
    console.log(`Pressed: ${item.name} (ID: ${item.id})`); // Log để debug

    // Sử dụng ID từ item để quyết định điều hướng
    switch (item.id) {
      case 3: // ID của 'Đặt phòng'
        // Điều hướng đến màn hình 'Booking' đã đăng ký trong App.js
        navigation.navigate('Booking');
        break;

        case 12:
        navigation.navigate('Handbook');
        break;

        case 16: // ID của 'Thời khoá biểu'
        navigation.navigate('Timetable'); // Điều hướng đến màn hình Timetable (Root Stack)
        break;

        case 10: // ID của 'lịch thi'
        navigation.navigate('ExamSchedule'); // Điều hướng đến màn hình Timetable (Root Stack)
        break;

      default:
        // Thông báo cho các chức năng chưa được cài đặt
        console.log(`Chức năng "${item.name}" chưa được liên kết.`);
        Alert.alert('Thông báo',`Chức năng "${item.name}" đang được phát triển hoặc chưa được liên kết.`
        );
        break;
    }
  };


  const renderFunctionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => handleFunctionPress(item)}
    >
      <FontAwesome5 name={item.icon} size={25} color="#002366" style={styles.icon} />
      <Text style={styles.text} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedFunctions).map((section, index) => (
          <View key={index} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section}</Text>
            <FlatList
              data={groupedFunctions[section]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderFunctionItem}
              numColumns={4}
              scrollEnabled={false}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002366',
    marginBottom: 12,
  },
  item: {
    width: itemSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#f9fafe',
  },
  icon: {
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
    fontSize: 12,
    color: '#002366',
  },
});

export default HomeScreen;