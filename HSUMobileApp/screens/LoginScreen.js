import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://10.101.38.182:5055/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("🎯 Login response:", data);

      if (response.ok && data.success) {
        Alert.alert("✅ Thành công", data.message);
        navigation.navigate("Home"); // chuyển qua màn Home
      } else {
        Alert.alert("❌ Đăng nhập thất bại", data.message || "Sai thông tin đăng nhập");
      }
    } catch (err) {
      console.log("❌ Lỗi login:", err.message);
      Alert.alert("Lỗi", "Không thể kết nối đến API");
    }
  };
  
    return (
      <View style={styles.container}>
        <Image
          source={require('../assets/hsulogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.header}>Đăng nhập HSU</Text>
        <TextInput
          style={styles.input}
          placeholder="Email sinh viên"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
    logo: { width: 160, height: 80, marginBottom: 24 },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#000080' },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
    },
    button: {
      backgroundColor: '#000080',
      padding: 14,
      borderRadius: 10,
      width: '100%',
      alignItems: 'center'
    },
    buttonText: { color: '#fff', fontWeight: '600' },
  });
  
  export default LoginScreen;
