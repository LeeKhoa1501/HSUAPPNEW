import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import homeData from '../assets/data/homeData.json';
import { Dimensions } from 'react-native';

const numColumns = 4;
const screenWidth = Dimensions.get('window').width;
const itemSize = screenWidth / numColumns - 20;

const HomeScreen = () => {
  const [functions, setFunctions] = useState([]);

  useEffect(() => {
    setFunctions(homeData.functions);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item}>
      <FontAwesome5 name={item.icon} size={28} color="#002366" style={styles.icon} />
      <Text style={styles.text} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={functions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    paddingHorizontal: 10,
    paddingTop: 20
  },
  list: {
    justifyContent: 'center',
  },
  item: {
    width: itemSize,
    alignItems: 'center',
    margin: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  icon: {
    marginBottom: 6
  },
  text: {
    textAlign: 'center',
    fontSize: 12,
    color: '#002366'
  }
});

export default HomeScreen;
