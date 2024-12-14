import React, { useMemo } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useAuthStore } from '../stores/authStore';
import { User } from '@react-native-google-signin/google-signin';

type UserRowProps = {
  label: string;
  value: string | null;
};

// Moved to constant to prevent recreation
const USER_FIELDS = [
  { id: '1', label: 'Name', key: 'name' },
  { id: '2', label: 'Email', key: 'email' },
  { id: '3', label: 'Family Name', key: 'familyName' },
  { id: '4', label: 'Given Name', key: 'givenName' },
  { id: '5', label: 'ID', key: 'id' },
] as const;

// Memoized to prevent unnecessary re-renders
const UserRow = React.memo(({ label, value }: UserRowProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || 'Not provided'}</Text>
  </View>
));

UserRow.displayName = 'UserRow';

export default function App() {
  const { signIn, signOut } = useAuthStore();
  const user = useAuthStore(state => state.user?.data.user);

  // Memoized data transformation to prevent unnecessary recalculations
  const userData = useMemo(() => {
    if (!user) return [];
    return USER_FIELDS.map(({ id, label, key }) => ({
      id,
      label,
      value: user[key as keyof typeof user]
    }));
  }, [user]);

  return (
    <View style={styles.container}>
      <Button title="Login" onPress={signIn} />
      {user && (
        <>
          <Button title="Logout" onPress={signOut} />
          <FlashList
            data={userData}
            renderItem={({ item }) => (
              <UserRow label={item.label} value={item.value} />
            )}
            estimatedItemSize={50}
            keyExtractor={item => item.id}
            removeClippedSubviews={true}
            initialNumToRender={5}
          />
        </>
      )}
    </View>
  );
}

// Styles moved to bottom and kept outside component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    width: 100,
  },
  value: {
    flex: 1,
  },
});
