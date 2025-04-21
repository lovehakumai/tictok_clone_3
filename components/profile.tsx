import { View, Text, TouchableOpacity, SafeAreaView, Image, FlatList, StyleSheet, Dimensions, ActivityIndicator } from 'react-native'; // StyleSheet, Dimensions, ActivityIndicator を追加
import { useAuth } from '@/providers/AuthProvider';
import { FollowingType, LikesType, UserType, VideoRow } from '@/types'; // VideoRow をインポート
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';

// 画面幅とアイテムサイズ計算
const screenWidth = Dimensions.get('window').width;
const itemPadding = 1; // アイテム間の隙間
const itemSize = (screenWidth - itemPadding * 4) / 3; // 3列の場合のアイテム幅

export default function Profile({
    user,
    following,
    followers,
    likes
}: {
    user: UserType | null,
    following: FollowingType[] | null,
    followers: any[] | null,
    likes: LikesType[] | null,
}) {
    const { user: authUser, signOut, following: myFollowing, getFollowing } = useAuth();
    // ★ 型を VideoRow[] に修正
    const [videos, setVideos] = useState<any[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

    // --- プロフィール画像取得 useEffect (getPublicUrl推奨) ---
    useEffect(() => {
        if (user?.id) {
            const avatarPath = `${user.id}/avatar.jpg`; // saveImageの実装と合わせる
            const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
            setProfilePictureUrl(data?.publicUrl ? `${data.publicUrl}?t=${new Date().getTime()}` : null);
        }
    }, [user?.id]);

    // --- pickImage, saveImage (前回の修正を適用推奨) ---
    const pickImage = async () => {
        if (authUser?.id !== user?.id) return;
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.1,
        });
        if (result.canceled) {
            console.error("pickImage / canceled");
            return;
        }
        if (result.assets[0].type === 'image') {
            setProfilePictureUrl(result.assets[0].uri);
            saveImage(result.assets[0].uri);
        }
    };

    const saveImage = async (uri: string) => {
        const fileName = 'avatar.jpg';
        const { error } = await supabase.storage
            .from(`avatars/${user?.id}`)
            .upload(fileName, {
                uri: uri,
                type: `image/${fileName?.split('.').pop()}`,
                name: fileName,
            }, {
                cacheControl: '3600',
                upsert: false,
                quality: 0.1,
            });
        if (error) {
            console.error('Error uploading Image:', error);
            return;
        }
    }

    const follow = async () => {
        const { error } = await supabase
          .from('Follower')
          .insert({
            follower_user_id: user?.id,
            user_id: item.User.id,
          });
        if (!error && !!user) {
          await getFollowing(user.id);
        }
      }
    
      const unFollow = async () => {
        const { error } = await supabase
          .from('Follower')
          .delete()
          .eq('user_id', user?.id)
          .eq('follower_user_id', authUser?.id);
        if (!error && !!user) {
          await getFollowing(user.id);
        }
      }

    // --- getVideos / getSignedUri (ロギングは適宜有効化) ---
    const getVideos = async () => {
        if (!user?.id) { setVideos([]); return; }
        setLoadingVideos(true);
        try {
            // テーブル名、関連名を実際の設計に合わせる
            const { data: videoData, error } = await supabase
                .from("Video") // 例: "videos" テーブル
                .select("*, User!inner(*)") // 例: "users" テーブル
                .eq("user_id", user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching video metadata:", error); setVideos([]);
            } else if (videoData && videoData.length > 0) {
                await getSignedUri(videoData as VideoRow[]);
            } else { setVideos([]); }
        } catch (e) {
            console.error("Exception fetching videos:", e); setVideos([]);
        } finally { setLoadingVideos(false); }
    }

    const getSignedUri = async (videoData: VideoRow[]) => {
        const validVideoData = videoData.filter(v => v.uri);
        const paths = validVideoData.map((v) => v.uri);
        if (paths.length === 0) { setVideos(validVideoData); return; }

        try {
            // ★ バケット名を確認！
            const { data: signedUrlsData, error } = await supabase.storage
                .from("videos") // ★★★★★ ここが正しいバケット名か確認！ ★★★★★
                .createSignedUrls(paths, 3600); // 1 hour expiration

            if (error) {
                console.error("Error creating signed URLs:", error);
                const result = validVideoData.map(v => ({ ...v, signedUrl: null })); // signedUrlはnullに
                setVideos(result); return;
            }
            if (signedUrlsData) {
                const result = validVideoData.map((v) => {
                    const signedUrlData = signedUrlsData.find((s) => s.path === v.uri);
                    return { ...v, signedUrl: signedUrlData?.signedUrl || null };
                });
                setVideos(result);
                // console.log("Result with Signed URLs:", result); // デバッグ用
            } else {
                const result = validVideoData.map(v => ({ ...v, signedUrl: null }));
                setVideos(result);
            }
        } catch (e) {
            console.error("Exception creating signed URLs:", e);
            const result = validVideoData.map(v => ({ ...v, signedUrl: null }));
            setVideos(result);
        }
    }

    useEffect(() => { getVideos(); }, [user?.id]);

    return (
        <SafeAreaView style={styles.container}>
            {/* --- プロフィールヘッダー --- */}
            <View style={styles.profileHeader}>
                <TouchableOpacity onPress={pickImage} disabled={authUser?.id !== user?.id}>
                    <Image source={{ uri: profilePictureUrl || 'https://placehold.co/80x80?text=No+Image' }} style={styles.profileImage} />
                </TouchableOpacity>
                <Text style={styles.username}>@{user?.username || 'username'}</Text>
                {/* ... Stats & Buttons ... */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}><Text style={styles.statLabel}>Following</Text><Text style={styles.statValue}>{following?.length || 0}</Text></View>
                    <View style={styles.statItem}><Text style={styles.statLabel}>Followers</Text><Text style={styles.statValue}>{followers?.length || 0}</Text></View>
                    <View style={styles.statItem}><Text style={styles.statLabel}>Likes</Text><Text style={styles.statValue}>{likes?.length || 0}</Text></View>
                </View>
                {authUser?.id === user?.id ? (
                    <TouchableOpacity style={styles.signOutButton} onPress={signOut}><Text style={styles.buttonText}>Sign out</Text></TouchableOpacity>
                ) : (<View style={styles.followButtonContainer}>{myFollowing && myFollowing.some(f => f.user_id === user?.id) ? (<TouchableOpacity style={[styles.followButton, styles.unfollowButton]} onPress={unFollow}><Text style={styles.buttonText}>Unfollow</Text></TouchableOpacity>) : (<TouchableOpacity style={[styles.followButton, styles.followActiveButton]} onPress={follow}><Text style={styles.buttonText}>Follow</Text></TouchableOpacity>)}</View>)}
            </View>

            {/* ★ デバッグ用Text削除 */}

            {/* --- ビデオグリッド --- */}
            {loadingVideos ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
            ) : (
                <FlatList
                    data={videos}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={3}
                    // ★ renderItem を修正
                    renderItem={({ item }: { item: VideoRow }) => (
                        <TouchableOpacity
                            style={styles.videoItemContainer} // ★ スタイル適用
                            onPress={() => console.log("Navigate to video:", item.id)}
                        >
                            {item.signedUrl ? ( // ★ signedUrl が存在するか確認
                                <Video
                                    source={{ uri: item.signedUrl }}
                                    style={styles.videoThumbnail} // ★ スタイル適用
                                    resizeMode={ResizeMode.COVER} // カバー表示
                                    shouldPlay={false} // 再生しない
                                    onError={(error) => console.warn(`Video Error (${item.id}):`, error)} // ★ エラーログ追加
                                />
                            ) : (
                                <View style={[styles.videoThumbnail, styles.thumbnailPlaceholder]}>
                                    {/* signedUrlがない or 読み込めない場合の表示 */}
                                    <Text style={styles.thumbnailErrorText}>X</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    // ★ FlatList のスタイル修正
                    style={styles.videoGridContainer}
                    contentContainerStyle={styles.videoGridContent} // コンテンツ全体のスタイル
                    ListEmptyComponent={() => ( // データがない場合の表示
                        !loadingVideos && <Text style={styles.noVideosText}>No videos posted yet.</Text>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

// --- StyleSheet ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    profileHeader: { alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', width: '100%', paddingTop: 20 },
    profileImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee', marginBottom: 10 },
    username: { fontWeight: 'bold', fontSize: 20, marginBottom: 15 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 15, paddingHorizontal: 10 },
    statItem: { alignItems: 'center' },
    statLabel: { fontSize: 14, color: '#666' },
    statValue: { fontSize: 16, fontWeight: 'bold' },
    signOutButton: { backgroundColor: '#dc3545', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, marginBottom: 10 },
    followButtonContainer: { width: '80%', marginBottom: 10 },
    followButton: { paddingVertical: 10, borderRadius: 8, alignItems: 'center', width: '100%' },
    unfollowButton: { backgroundColor: '#6c757d' },
    followActiveButton: { backgroundColor: '#007bff' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    // ★ FlatList スタイル
    videoGridContainer: {
        flex: 1, // 親Viewの残りのスペースを埋める
        width: '100%',
    },
    videoGridContent: {
        padding: itemPadding, // グリッド全体のパディング
        // alignItems: 'flex-start', // 不要な場合が多い
    },
    // ★ アイテムコンテナ (TouchableOpacity) のスタイル
    videoItemContainer: {
        width: itemSize,        // 計算した幅
        height: itemSize * 1.6, // 高さは任意（例: 16:9や4:3など）
        margin: itemPadding,      // アイテム間のマージン
        backgroundColor: '#e0e0e0', // ローディング/エラー時の背景色
    },
    // ★ Video コンポーネントのスタイル
    videoThumbnail: {
        width: '100%',
        height: '100%',
    },
    // ★ signedUrlがない場合のプレースホルダースタイル
    thumbnailPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0', // 少し薄いグレー
    },
    thumbnailErrorText: {
        fontSize: 24,
        color: '#a0a0a0', // 少し濃いグレー
        fontWeight: 'bold',
    },
    noVideosText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#888',
        padding: 20,
    },
});