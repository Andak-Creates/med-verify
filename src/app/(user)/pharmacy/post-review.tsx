import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostReviewScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    // In a real app, this submits to the backend
    router.replace('/(user)/home' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.successIconBox}>
              <Ionicons name="checkmark-circle" size={56} color="#10B981" />
            </View>
            <Text style={styles.title}>Consultation Completed</Text>
            <Text style={styles.subtitle}>How was your session with Dr. Julian?</Text>
          </View>

          {/* Rating Stars */}
          <View style={styles.ratingBox}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={42}
                    color={star <= rating ? "#F59E0B" : "#D1D5DB"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {rating === 0 ? "Tap a star to rate" : 
               rating === 5 ? "Excellent!" : 
               rating >= 3 ? "Good" : "Needs Improvement"}
            </Text>
          </View>

          {/* Feedback Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Leave Feedback (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What went well? Was the pharmacist helpful?"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={feedback}
              onChangeText={setFeedback}
            />
          </View>

          <View style={{ flex: 1, minHeight: 40 }} />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Submit Review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(user)/home' as any)}>
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successIconBox: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  ratingBox: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  feedbackSection: {
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#111827',
    minHeight: 120,
  },
  actions: {
    gap: 12,
  },
  submitBtn: {
    backgroundColor: '#0B1C5A',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
});
