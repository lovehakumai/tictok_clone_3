import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const recordVideo = async()=>{
    if (isRecording) {
      // Stop recording
      console.log("isRecording", isRecording);
      setIsRecording(false);
      cameraRef.current?.stopRecording();
    } else {
      // Start recording
      console.log("isRecording", isRecording);
      setIsRecording(true);
      const video = await cameraRef.current?.recordAsync();
      setVideoUri(video!.uri);
      console.log("video", video);
    }
  }

  const saveVideo = () => {
    if (videoUri) {
      // Save the video to the device's storage
      // You can use a library like expo-file-system to save the video
      // const fileUri = FileSystem.documentDirectory + 'video.mp4';
      // await FileSystem.moveAsync({
      //   from: videoUri,
      //   to: fileUri,
      // });
      // console.log('Video saved to:', fileUri);
      // You can also upload the video to a server or perform any other action  with it
      console.log('Video URI:', videoUri);
    }
  };

  return (
    <CameraView mode='video' ref={cameraRef} style={{flex: 1}} facing={facing}>
      <View className='flex-1 justify-end'>
        <View className='flex-row items-center justify-around mb-10' >
          <TouchableOpacity className='items-end justify-end' onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={50} color="transparent" />
          </TouchableOpacity>
          {videoUri ? (
            <TouchableOpacity className="items-end justify-end" onPress={saveVideo}>
              <Ionicons name='checkmark-circle' size={100} color="green" />
            </TouchableOpacity>
          ):(
            <TouchableOpacity className="items-end justify-end"  onPress={recordVideo}>
              {!isRecording ? (<Ionicons name='radio-button-on' size={100} color="white"/>):(<Ionicons name='pause-circle' size={100} color="red"/>)}
            </TouchableOpacity>
          )}
          <TouchableOpacity className='items-end justify-end' onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={50} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </CameraView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
