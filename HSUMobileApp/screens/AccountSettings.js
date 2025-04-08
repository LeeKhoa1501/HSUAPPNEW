import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const AccountSettingsScreen = () => {
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Tài khoản */}
      <Text style={styles.sectionTitle}>Tài khoản</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row}>
          <FontAwesome name="user-circle" size={24} color="#555" />
          <Text style={styles.nameText}>  Lê Minh Khoa  -  <Text style={styles.studentId}>22204822</Text></Text>
        </TouchableOpacity>

        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <FontAwesome name="fingerprint" size={20} color="#888" />
            <Text style={styles.optionText}>  Sinh trắc học</Text>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
          />
        </View>

        <TouchableOpacity style={styles.row}>
          <FontAwesome name="qrcode" size={20} color="#888" />
          <Text style={styles.optionText}>  Mã QR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <FontAwesome name="id-card" size={20} color="#888" />
          <Text style={styles.optionText}>  Student card</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <FontAwesome name="sign-out" size={20} color="#888" />
          <Text style={styles.optionText}>  Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Hỗ trợ */}
      <Text style={styles.sectionTitle}>Hỗ trợ</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row}>
          <FontAwesome name="phone" size={20} color="#888" />
          <Text style={styles.optionText}>  Liên hệ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <FontAwesome name="play-circle" size={20} color="#888" />
          <Text style={styles.optionText}>  Video</Text>
        </TouchableOpacity>
      </View>

      {/* Hoa Sen */}
      <Text style={styles.sectionTitle}>Hoa Sen</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <FontAwesome name="mobile" size={20} color="#888" />
          <Text style={styles.optionText}>  Phiên bản 3.2.2</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AccountSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f9f9",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  studentId: {
    color: "#f7931e",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});
