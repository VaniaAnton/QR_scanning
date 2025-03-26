import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

export default function ScannerTab() {
  useEffect(() => {
    // Open the scanner screen automatically
    router.push('/scanner');
  }, []);

  // Return an empty container (won't be visible because of immediate navigation)
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
}); 