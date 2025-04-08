import { supabase } from '@/utils/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const router = useRouter();

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
          console.log("recordVideo / Video URI:", video.uri);
        } else {
          console.error("Failed to record video");
        }
      }
    } catch (error) {
      console.error("Error recording video:", error);
    }
  };

  const saveVideo = async () => {
    console.log("saveVideo");

    if (videoUri) {
      console.log('save / Video URI:', videoUri);
      const fileName = videoUri.split('/').pop();
      if(fileName === undefined) {
        console.error('File name is undefined');
        return;
      }
      const formData = new FormData();

      // Upload the video to storage and insert its uri to table
      try {
        // Upload the video to Supabase storage
        const { data, error } = await supabase.storage
          .from('videos')
          .upload(fileName, {
            uri: videoUri,
            type: `video/${fileName?.split('.').pop()}`,
            name: fileName,
          });
          if (error) {
            console.error('Error uploading video:', error);
            return;
          }

        // Insert the video URL into the table
        const { data: userData, error: userError } = await supabase.auth.getUser();
        const { error: videoErrror } = await supabase
          .from('Video')
          .insert({
            uri: data?.path,
            user_id: userData.user?.id, 
            title: fileName
          });
        if (videoErrror) {
          console.error('Error inserting video URL into table:', videoErrror);
          return;
        }
        console.log('Video uploaded to storage successfully:', data);
        router.back();
      } catch (error) {
        console.error('Unexpected error uploading video:', error);
      }
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
  };

  return (
    <CameraView mode='video' ref={cameraRef} style={{flex: 1}} facing={facing}>
      <View className='flex-1 justify-end'>
        <View className='flex-row items-center justify-around mb-10' >
          <TouchableOpacity className='items-end justify-end' onPress={pickImage}>
            <Ionicons name="aperture" size={50} color="white" />
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
