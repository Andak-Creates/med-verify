import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

const DAYS = ['Mon 9', 'Tue 10', 'Wed 11', 'Thu 12', 'Fri 13', 'Sat 14'];

const CONSULTATION_TYPES = [
  { id: 'video', icon: 'videocam-outline', label: 'Video Call', price: 'â‚¦2,500' },
  { id: 'chat', icon: 'chatbubble-ellipses-outline', label: 'Text Chat', price: 'â‚¦1,500' },
  { id: 'phone', icon: 'call-outline', label: 'Phone Call', price: 'â‚¦2,000' },
];

export default function BookConsultationScreen() {
  const router = useRouter();
  const { pharmacyId } = useLocalSearchParams<{ pharmacyId: string }>();
  const [selectedDay, setSelectedDay] = useState('Mon 9');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState('video');

  const canBook = selectedDay && selectedTime && selectedType;

  const handleBook = () => {
    router.replace({
      pathname: '/(user)/pharmacy/booking-confirm',
      params: { day: selectedDay, time: selectedTime, type: selectedType },
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}
        >
          <Ionicons name="chevron-back" size={22} color="#0B1C5A" />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#0B1C5A', marginRight: 40 }}>
          Book Consultation
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 24 }}>

          {/* Consultation Type */}
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#8E9CB2', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Consultation Type
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
            {CONSULTATION_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                style={{
                  flex: 1, backgroundColor: selectedType === type.id ? '#0B1C5A' : '#fff',
                  borderRadius: 16, padding: 14, alignItems: 'center', gap: 6,
                  borderWidth: 1.5, borderColor: selectedType === type.id ? '#0B1C5A' : '#E5E7EB',
                  shadowColor: '#0B1C5A', shadowOpacity: selectedType === type.id ? 0.15 : 0.03, shadowRadius: 8, elevation: 2,
                }}
              >
                <Ionicons name={type.icon as any} size={22} color={selectedType === type.id ? '#fff' : '#0B1C5A'} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: selectedType === type.id ? '#fff' : '#0B1C5A', textAlign: 'center' }}>{type.label}</Text>
                <Text style={{ fontSize: 12, fontWeight: '900', color: selectedType === type.id ? 'rgba(255,255,255,0.8)' : '#8E9CB2' }}>{type.price}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Picker */}
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#8E9CB2', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Select Date â€” June 2026
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
            {DAYS.map(day => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={{
                  width: 58, height: 70, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: selectedDay === day ? '#0B1C5A' : '#fff',
                  borderWidth: 1.5, borderColor: selectedDay === day ? '#0B1C5A' : '#E5E7EB',
                  shadowColor: '#0B1C5A', shadowOpacity: selectedDay === day ? 0.15 : 0.03, shadowRadius: 6, elevation: 2,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', color: selectedDay === day ? 'rgba(255,255,255,0.7)' : '#8E9CB2', marginBottom: 4 }}>
                  {day.split(' ')[0].toUpperCase()}
                </Text>
                <Text style={{ fontSize: 20, fontWeight: '900', color: selectedDay === day ? '#fff' : '#0B1C5A' }}>
                  {day.split(' ')[1]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Time Slots */}
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#8E9CB2', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Available Time Slots
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
            {TIME_SLOTS.map(slot => (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedTime(slot)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                  backgroundColor: selectedTime === slot ? '#0B1C5A' : '#fff',
                  borderWidth: 1.5, borderColor: selectedTime === slot ? '#0B1C5A' : '#E5E7EB',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: selectedTime === slot ? '#fff' : '#374151' }}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary */}
          {canBook && (
            <View style={{ backgroundColor: '#EEF1FB', borderRadius: 18, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E0E5F5' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#8E9CB2', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Booking Summary</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: '#6B7280' }}>Type</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0B1C5A', textTransform: 'capitalize' }}>{CONSULTATION_TYPES.find(t => t.id === selectedType)?.label}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: '#6B7280' }}>Date & Time</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0B1C5A' }}>{selectedDay}, {selectedTime}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#6B7280' }}>Amount</Text>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#0B1C5A' }}>{CONSULTATION_TYPES.find(t => t.id === selectedType)?.price}</Text>
              </View>
            </View>
          )}

          {/* Book Button */}
          <Pressable
            onPress={handleBook}
            disabled={!canBook}
            style={({ pressed }) => ({
              backgroundColor: canBook ? '#0B1C5A' : '#0B1C5A40',
              borderRadius: 18, paddingVertical: 18,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Confirm Booking</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

