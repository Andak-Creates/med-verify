import { Text, View } from 'react-native';

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <View
      style={{
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(220, 38, 38, 0.25)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
      }}
    >
      <Text style={{ color: '#B91C1C', fontSize: 13, fontWeight: '600', lineHeight: 18 }}>
        {message}
      </Text>
    </View>
  );
}
