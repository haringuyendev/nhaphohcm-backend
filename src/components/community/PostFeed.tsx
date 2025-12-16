import { SocialPost } from '@/payload-types';
import { PostCard } from './PostCard';

interface PostFeedProps {
  posts: SocialPost[];
}

export function PostFeed({ posts }: PostFeedProps) {
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
