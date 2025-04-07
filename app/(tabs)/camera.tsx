import { supabase } from '@/utils/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  if (!permission || !microphonePermission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted || !microphonePermission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button 
          onPress={()=>{
                        requestPermission();
                        requestMicrophonePermission()
                      }
                  } 
          title="grant permission" 
        />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const recordVideo = async () => {
    try {
      if (isRecording) {
        setIsRecording(false);
        cameraRef.current?.stopRecording();
      } else {
        setIsRecording(true);
        const video = await cameraRef.current?.recordAsync();
        if (video) {
          setVideoUri(video.uri);
          console.log("Video URI:", video.uri);
        } else {
          console.error("Failed to record video");
        }
      }
    } catch (error) {
      console.error("Error recording video:", error);
    }
  };

  const saveVideo = async() => {
    console.log("saveVideo");
    
    if (videoUri) {
      console.log('Video URI:', videoUri);
      const formData = new FormData();
      const fileName = videoUri.split('/').pop();
      formData.append('file', {
        uri: videoUri,
        name: fileName,
        type: `video/${fileName?.split('.').pop()}}`,
      });
      console.log('Form Data:', formData);
      const {data, error} = await supabase.storage
        .from('Video')
        .upload(fileName, formData, {
          cacheControl: '3600000000',
          upsert: false,
        });
      if (error) {
        console.error('Error uploading video:', error);
      }
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
