// screens/BookingScreen.js
import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import {View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert,ActivityIndicator, Modal} from 'react-native';
import { RadioButton, Provider as PaperProvider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Thêm useFocusEffect

// --- Component LabeledInput (Tối ưu với React.memo) ---
const LabeledInput = React.memo(({ label, value, onChangeText, placeholder, keyboardType = 'default', editable = true, multiline = false, numberOfLines = 1 }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.disabledInput, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#adb5bd"
      keyboardType={keyboardType}
      editable={editable}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
));

// --- Component RadioSelection (Tối ưu với React.memo) ---
const RadioSelection = React.memo(({ label, value, status, onPress }) => (
  // Sửa lại onPress để truyền value trực tiếp
  <TouchableOpacity style={styles.radioRow} onPress={() => onPress(value)}>
    <RadioButton value={value} status={status} onPress={() => onPress(value)} color="#002366" />
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
));

// --- Component ModalPicker (Tối ưu với React.memo) ---
const ModalPicker = React.memo(({ label, options = [], selectedValue, onValueChange, placeholder = "Chọn...", isLoading = false }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState(selectedValue);
  const validOptions = Array.isArray(options) ? options : [{ label: placeholder, value: '' }];
  const selectedLabel = validOptions.find(option => option && option.value === selectedValue)?.label || placeholder;

  const handleDone = () => { onValueChange(tempValue); setModalVisible(false); };
  const handleCancel = () => { setTempValue(selectedValue); setModalVisible(false); }
  useEffect(() => { setTempValue(selectedValue); }, [selectedValue]); // Cập nhật tempValue khi selectedValue thật thay đổi

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.pickerTrigger} onPress={() => !isLoading && setModalVisible(true)} disabled={isLoading}>
        {isLoading ? (<ActivityIndicator size="small" color="#002366" />) : (<Text style={selectedValue ? styles.pickerTriggerText : styles.pickerPlaceholder} numberOfLines={1}>{selectedLabel}</Text>)}
        <FontAwesome5 name="chevron-down" size={14} color="#6c757d" style={styles.pickerIcon} />
      </TouchableOpacity>
      <Modal transparent={true} visible={modalVisible} animationType="slide" onRequestClose={handleCancel}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleCancel}>
          <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel}><Text style={styles.modalButtonText}>Hủy</Text></TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={handleDone}><Text style={[styles.modalButtonText, styles.modalButtonDone]}>Xong</Text></TouchableOpacity>
            </View>
            <Picker selectedValue={tempValue} onValueChange={setTempValue} style={styles.modalPicker} itemStyle={styles.pickerItemTextIOS}>
              {validOptions.map(option => (
                <Picker.Item key={option?.value ?? Math.random().toString()} label={String(option?.label ?? '...')} value={option?.value} />
              ))}
            </Picker>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

// --- API BASE URL ---
const API_BASE_URL = 'http://10.101.38.182:5000';

const BookingScreen = () => {
  const navigation = useNavigation(); // Lấy navigation object

  // --- State ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date());
  const [showDatePickerAndroid, setShowDatePickerAndroid] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [attendees, setAttendees] = useState('');
  const [purposeText, setPurposeText] = useState('');
  const [selectedPurposeRadio, setSelectedPurposeRadio] = useState('');
  const [notes, setNotes] = useState('');
  const [agree, setAgree] = useState(false);
  const [locationsData, setLocationsData] = useState([{ label: 'Đang tải...', value: '' }]);
  const [shiftsData, setShiftsData] = useState([{ label: 'Đang tải...', value: '' }]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isLoadingShifts, setIsLoadingShifts] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- purposeOptions ---
  const purposeOptions = [ 
    { label: "Tổ chức sự kiện / Đồ án môn học", value: "event_project" },
     { label: "Dán poster", value: "poster" },
      { label: "Đặt bàn tư vấn", value: "consult" },
       { label: "Khác (ghi rõ ở mục đích)", value: "other" }
  ];

  // --- useCallback để tránh tạo lại hàm fetchData mỗi lần render ---
  const fetchData = useCallback(async (isMountedRef) => {
    console.log("BK_SCREEN: Bắt đầu fetch dữ liệu...");
    // Reset state trước khi fetch
    setIsLoadingLocations(true); setIsLoadingShifts(true); setFetchError(null);
    let locationError = null; let shiftError = null;

    // Fetch Locations
    try {
        const locResponse = await fetch(`${API_BASE_URL}/api/locations`);
        if (!isMountedRef.current) return; // Kiểm tra trước khi xử lý response
        if (!locResponse.ok) throw new Error(`Locations HTTP error! status: ${locResponse.status}`);
        const locData = await locResponse.json();
        if (!isMountedRef.current) return;
        if (locData.success && Array.isArray(locData.data)) {
            const formattedLocations = locData.data.map(loc => ({ label: loc.name || 'N/A', value: loc._id }));
            setLocationsData([{ label: 'Chọn địa điểm...', value: '' }, ...formattedLocations]);
        } else { throw new Error(locData.message || 'Invalid locations data'); }
    } catch (error) { console.error("Fetch locations error:", error); locationError = "Cannot load locations."; }
    finally { if (isMountedRef.current) setIsLoadingLocations(false); }

    // Fetch Shifts (có thể chạy song song nếu muốn bằng Promise.all)
    try {
        const shiftResponse = await fetch(`${API_BASE_URL}/api/shifts`);
         if (!isMountedRef.current) return;
        if (!shiftResponse.ok) throw new Error(`Shifts HTTP error! status: ${shiftResponse.status}`);
        const shiftData = await shiftResponse.json();
         if (!isMountedRef.current) return;
        if (shiftData.success && Array.isArray(shiftData.data)) {
             const formattedShifts = shiftData.data.map(s => ({ label: s.label, value: s._id })); // API trả về label, _id
             setShiftsData([{ label: 'Chọn ca học...', value: '' }, ...formattedShifts]);
        } else { throw new Error(shiftData.message || 'Invalid shifts data'); }
    } catch (error) { console.error("Fetch shifts error:", error); shiftError = "Cannot load shifts."; }
    finally { if (isMountedRef.current) setIsLoadingShifts(false); }

    // Set Error
    if (isMountedRef.current && (locationError || shiftError)) { setFetchError(locationError || shiftError); }
    console.log("BK_SCREEN: Fetch dữ liệu hoàn tất.");
  }, []); // useCallback không có dependency vì không dùng state/prop bên ngoài trực tiếp

  // --- useEffect để gọi fetchData khi màn hình focus ---
  useFocusEffect( // Dùng useFocusEffect thay cho useEffect để fetch lại khi quay lại màn hình
    useCallback(() => {
      let isMountedRef = { current: true }; // Dùng ref để lưu trạng thái mount
      fetchData(isMountedRef);
      return () => { isMountedRef.current = false; }; // Cleanup khi unmount hoặc mất focus
    }, [fetchData]) // Dependency là hàm fetchData đã được useCallback
  );

  // --- Handlers ---
   const handleDateChange = (event, selectedDate) => { const currentDate = selectedDate || bookingDate; if (Platform.OS === 'android') { setShowDatePickerAndroid(false); } setBookingDate(currentDate); };
   const formatDate = (date) => { if (!date) return ''; let day = date.getDate().toString().padStart(2, '0'); let month = (date.getMonth() + 1).toString().padStart(2, '0'); let year = date.getFullYear(); return `${day}/${month}/${year}`; };

   const handleSendBooking = async () => {
    // --- Kiểm tra input ---
    const inputs = [
        { value: phoneNumber.trim(), name: "Số điện thoại" },
        { value: selectedLocation, name: "Địa điểm" },
        { value: selectedShift, name: "Ca học" },
        { value: startTime.trim(), name: "Giờ bắt đầu" },
        { value: endTime.trim(), name: "Giờ kết thúc" },
        { value: attendees.trim(), name: "Số người tham dự" },
        { value: selectedPurposeRadio, name: "Mục đích sử dụng" },
    ];
    for (const input of inputs) {
        if (!input.value) return Alert.alert('Thiếu thông tin', `Vui lòng nhập/chọn ${input.name}.`);
    }
    if (isNaN(Number(attendees)) || Number(attendees) <= 0) return Alert.alert('Không hợp lệ', 'Vui lòng nhập số người tham dự hợp lệ.');
    if (!agree) return Alert.alert('Xác nhận', 'Bạn cần đồng ý với chính sách đặt phòng.');

    // --- Chuẩn bị dữ liệu ---
    const bookingData = { locationId: selectedLocation, shiftId: selectedShift, bookingDate: formatDate(bookingDate), startTime, endTime, attendees: Number(attendees), purpose: selectedPurposeRadio, purposeDetail: purposeText.trim(), notes: notes.trim() };

    console.log("BK_SEND: Sending data:", JSON.stringify(bookingData, null, 2));
    setIsSubmitting(true);
    let token;
    try {
        token = await AsyncStorage.getItem('userToken');
        console.log("BK_SEND: Token:", token ? 'Found' : 'NOT FOUND');
        if (!token) { Alert.alert("Lỗi xác thực", "Vui lòng đăng nhập lại.", [{ text: "OK", onPress: () => navigation.replace('Login') }]); setIsSubmitting(false); return; }

        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(bookingData)
        });

        console.log("BK_SEND: Response Status:", response.status);
        const responseText = await response.text();
        console.log("BK_SEND: Raw Response Text:", responseText);

        let result;
        try { result = JSON.parse(responseText); }
        catch (parseError) {
             console.error("BK_SEND: JSON Parse Error:", parseError);
             Alert.alert("Lỗi Phản Hồi", `Server không trả về JSON hợp lệ. Status: ${response.status}.`);
             setIsSubmitting(false); return;
        }

        console.log("BK_SEND: Parsed Response:", result);
        if (response.ok && result.success) {
            Alert.alert("Thành công!", result.message || "Yêu cầu đã được gửi!");
            navigation.goBack();
        } else { Alert.alert("Gửi thất bại", result.message || `Lỗi từ server (Status: ${response.status})`); }
    } catch (error) {
        console.error("BK_SEND: Fetch API Error:", error);
        if (String(error).includes('Network request failed')) { Alert.alert("Lỗi mạng", "Không thể kết nối đến server."); }
        else { Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi yêu cầu."); }
    } finally { setIsSubmitting(false); }
  };

  // --- Render UI ---
  // Render Lỗi fetch ban đầu
  if (fetchError && !isLoadingLocations && !isLoadingShifts) {
    return ( <SafeAreaView style={styles.safeArea}><View style={styles.centered}><Text style={styles.errorText}>Lỗi tải dữ liệu:</Text><Text style={styles.errorText}>{fetchError}</Text></View></SafeAreaView> );
  }

  // Render Form chính
  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" >

          {/* --- Số điện thoại --- */}
          <LabeledInput label="Số điện thoại" value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Nhập số điện thoại liên hệ..." keyboardType="phone-pad" />

          {/* --- Ngày đặt --- */}
          <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày đặt</Text>
              {Platform.OS === 'ios' ? ( <DateTimePicker testID="datePickerIOS" value={bookingDate} mode={'date'} display="spinner" onChange={handleDateChange} style={styles.iosDatePicker} locale="vi-VN" /> ) : ( <TouchableOpacity style={styles.datePickerTrigger} onPress={() => setShowDatePickerAndroid(true)} > <Text style={bookingDate ? styles.datePickerText : styles.datePickerPlaceholder}>{formatDate(bookingDate)}</Text> <FontAwesome5 name="calendar-alt" size={18} color="#6c757d" /> </TouchableOpacity> )}
          </View>
          {Platform.OS === 'android' && showDatePickerAndroid && ( <DateTimePicker testID="datePickerAndroid" value={bookingDate} mode={'date'} display="default" onChange={handleDateChange} /> )}

          {/* --- Location Picker --- */}
          <ModalPicker label="Địa điểm" options={locationsData} selectedValue={selectedLocation} onValueChange={setSelectedLocation} placeholder="Chọn địa điểm..." isLoading={isLoadingLocations} />

          {/* --- Thời gian --- */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thời gian</Text>
            <View style={styles.timeRow}>
              <TextInput style={[styles.input, styles.timeInput]} value={startTime} onChangeText={setStartTime} placeholder="HH:mm" maxLength={5} keyboardType="numbers-and-punctuation" />
              <Text style={styles.timeSeparator}>–</Text>
              <TextInput style={[styles.input, styles.timeInput]} value={endTime} onChangeText={setEndTime} placeholder="HH:mm" maxLength={5} keyboardType="numbers-and-punctuation" />
            </View>
          </View>

          {/* --- Ca học Picker --- */}
           <ModalPicker label="Ca học" options={shiftsData} selectedValue={selectedShift} onValueChange={setSelectedShift} placeholder="Chọn ca học..." isLoading={isLoadingShifts} />

          {/* --- Số người tham dự --- */}
          <LabeledInput label="Số người tham dự" value={attendees} onChangeText={setAttendees} keyboardType="number-pad" placeholder="Nhập số lượng" />

          {/* --- Mục đích chi tiết --- */}
          <LabeledInput label="Mục đích (chi tiết nếu chọn Khác)" value={purposeText} onChangeText={setPurposeText} placeholder="Ví dụ: Họp nhóm, chuẩn bị sự kiện..." />

          {/* --- Mục đích sử dụng (Radio) --- */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mục đích sử dụng</Text>
            <RadioButton.Group onValueChange={setSelectedPurposeRadio} value={selectedPurposeRadio}>
              {purposeOptions.map(option => ( <RadioSelection key={option.value} label={option.label} value={option.value} status={selectedPurposeRadio === option.value ? 'checked' : 'unchecked'} onPress={setSelectedPurposeRadio} /> ))}
            </RadioButton.Group>
          </View>

          {/* --- Ghi chú --- */}
          <LabeledInput label="Mô tả / Ghi chú thêm" value={notes} onChangeText={setNotes} placeholder="Yêu cầu thêm về thiết bị,..." multiline numberOfLines={4} />

          {/* --- Agreement --- */}
          <TouchableOpacity style={styles.agreementRow} onPress={() => setAgree(!agree)}>
            <RadioButton value="agree" status={agree ? 'checked' : 'unchecked'} onPress={() => setAgree(!agree)} color="#002366" />
            <Text style={styles.agreementText}> Tôi cam kết tuân thủ <Text style={styles.policyLink} onPress={() => Alert.alert('Chính sách', 'Hiển thị nội dung chính sách...')}> chính sách [tại đây] </Text> </Text>
          </TouchableOpacity>

          {/* --- Nút Gửi --- */}
          <TouchableOpacity style={[styles.submitButton, (!agree || isSubmitting) && styles.submitButtonDisabled]} onPress={handleSendBooking} disabled={!agree || isSubmitting}>
            {isSubmitting ? (<ActivityIndicator size="small" color="#fff" />) : (<Text style={styles.submitButtonText}>Gửi Yêu Cầu</Text>)}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
  safeArea:{flex:1,backgroundColor:'#f8f9fa'},
  container:{flex:1},
  scrollContent:{paddingVertical:20,paddingHorizontal:16,paddingBottom:40},
  inputGroup:{marginBottom:22},
  label:{fontSize:15,fontWeight:'600',color:'#495057',marginBottom:8},
  input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#dee2e6',borderRadius:8,paddingHorizontal:14,paddingVertical:Platform.OS==='ios'?12:10,fontSize:15,color:'#212529'},
  disabledInput:{backgroundColor:'#e9ecef',color:'#6c757d'},
  multilineInput:{height:100,paddingTop:12},
  pickerTrigger:{backgroundColor:'#fff',borderWidth:1,borderColor:'#dee2e6',borderRadius:8,paddingHorizontal:14,paddingVertical:12,minHeight:48,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  pickerTriggerText:{fontSize:15,color:'#212529'},
  pickerPlaceholder:{fontSize:15,color:'#adb5bd'},
  pickerIcon:{},loadingIndicator:{alignSelf:'center',paddingVertical:15},
  modalOverlay:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,.4)'},
  modalContent:{backgroundColor:'#f8f9fa',borderTopLeftRadius:15,borderTopRightRadius:15,paddingBottom:20},
  modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:'#dee2e6'},
  modalTitle:{fontSize:16,fontWeight:'600',color:'#495057'},
  modalButtonText:{fontSize:16,color:'#007bff'},
  modalButtonDone:{fontWeight:'bold'},
  modalPicker:{width:'100%',backgroundColor:Platform.OS==='ios'?'#f8f9fa':undefined},
  pickerItemTextIOS:{color:'#000',fontSize:17},
  timeRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  timeInput:{flex:.45,textAlign:'center'},
  timeSeparator:{fontSize:18,color:'#6c757d',fontWeight:'bold',marginHorizontal:5},
  radioRow:{flexDirection:'row',alignItems:'center',marginBottom:12},
  radioLabel:{fontSize:15,color:'#212529',marginLeft:8},
  agreementRow:{flexDirection:'row',alignItems:'center',marginVertical:15,paddingVertical:5},
  agreementText:{flex:1,fontSize:14,color:'#495057',marginLeft:8,lineHeight:20},
  policyLink:{color:'#0056b3',fontWeight:'bold'},
  submitButton:{backgroundColor:'#002366',paddingVertical:15,borderRadius:10,alignItems:'center',marginTop:10,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:.15,shadowRadius:3,elevation:3},
  submitButtonDisabled:{backgroundColor:'#adb5bd',elevation:0,shadowOpacity:0},
  submitButtonText:{color:'#fff',fontSize:16,fontWeight:'bold'},
  datePickerTrigger:{backgroundColor:'#fff',borderWidth:1,borderColor:'#dee2e6',borderRadius:8,paddingHorizontal:14,paddingVertical:Platform.OS==='ios'?12:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  datePickerText:{fontSize:15,color:'#212529'},datePickerPlaceholder:{fontSize:15,color:'#adb5bd'},
  iosDatePicker:{height:150},centered:{flex:1,justifyContent:'center',alignItems:'center',padding:20},errorText:{color:'red',fontSize:16,textAlign:'center',marginBottom:10}
});

export default BookingScreen;