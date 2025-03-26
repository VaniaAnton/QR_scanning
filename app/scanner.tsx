import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import React from 'react';

export default function Scanner() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [barcodePermission, requestBarcodePermission] = useCameraPermissions();
  const [message, setMessage] = useState<string>(''); // For backend response

  useEffect(() => {
    requestPermissions();
  }, []);

  // Reset scanner state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setScannedData('');
    }, [])
  );

  const requestPermissions = async () => {
    await requestCameraPermission();
    await requestBarcodePermission();
  };

  if (!cameraPermission || !barcodePermission) {
    return <View style={styles.container}><Text>Loading permissions...</Text></View>;
  }

  if (!cameraPermission.granted || !barcodePermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera and barcode scanner permissions</Text>
        <Button onPress={requestPermissions} title="Grant permissions" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleBarCodeScanned = ({ type, data }: BarCodeScannerResult) => {
    setScanned(true);
    setScannedData(data);
    sendScannedDataToBackend(data);
  };

  const sendScannedDataToBackend = async (data: string) => {
    try {
      setMessage('Sending data to backend...');
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scannedData: data }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`Success: ${result.scannedData}`);
      } else {
        setMessage('Error sending data to the server.');
      }
    } catch (error) {
      setMessage('Error: Unable to send data.');
    }
  };

  const handleBackPress = () => {
    setScanned(false);
    setScannedData('');
    setMessage('');
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417', 'ean13', 'code128'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>

        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => {
            setScanned(false);
            setScannedData('');
            setMessage('');
          }}
        >
          <Text style={styles.text}>Scan Again</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={toggleCameraFacing}
          >
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Text style={styles.text}>Back</Text>
          </TouchableOpacity>
        </View>

        {scannedData ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Scanned QR Code:</Text>
            <Text style={styles.resultContent}>{scannedData}</Text>
          </View>
        ) : null}

        {message ? (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>
        ) : null}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    color: 'yellow',
    paddingBottom: 10,
  },
  messageContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  button: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    alignItems: 'center',
  },
  backButton: {
    padding: 15,
    backgroundColor: 'rgba(255,0,0,0.6)',
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  resultContainer: {
    position: 'absolute',
    top: 50,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultContent: {
    color: 'lightgreen',
    fontSize: 14,
  },
  centerButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    transform: [{ translateY: -25 }],
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    zIndex: 10,
  },
});
