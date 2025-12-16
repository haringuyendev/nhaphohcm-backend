export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage: string;
  membersCount: number;
  postsCount: number;
  isJoined: boolean;
}

export interface Post {
  id: string;
  communityId: string;
  communityName: string;
  communityAvatar: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: Date;
}
