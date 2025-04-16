export type VideoRow = {
  id: string;
  title: string;
  uri: string;
  user_id: string;
  created_at: string; // ISO文字列
  signedUrl?: string; // 署名付きURL
  User: {
    id: string;
    username: string;
  };
};

export interface UserType {
  id: string;
  username: string;
}

export interface LikesType {
  id: string;
  user_id: string;
  video_id: string;
  video_user_id: string;
}