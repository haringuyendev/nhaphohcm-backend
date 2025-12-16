import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Community, Media, SocialPost, User } from '@/payload-types';
import Image from 'next/image';
import { RichText } from '../RichText';

interface PostCardProps {
  post: SocialPost;
  isLiked?: boolean;
}

export function PostCard({ post, isLiked }: PostCardProps) {
  const [likesCount, setLikesCount] = useState(post.likeCount);

  const handleLike = () => {
    console.log('Like post', post.id);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
    toast.success('Đã sao chép link bài viết!');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  return (
    <article className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/community/${(post.community as Community).id}`}>
            <Image 
              width={40}
              height={40}
              src={((post.community as Community).avatar as Media).url??''}
              alt={(post.community as Community).name}
              className="w-10 h-10 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link 
              href={`/community/${(post.community as Community).id}`}
              className="font-semibold text-sm hover:underline text-foreground"
            >
              {(post.community as Community).name}
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{(post.author as User).name}</span>
              <span>•</span>
              <span>{formatTime(new Date(post.createdAt))}</span>
            </div>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-muted transition-colors">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-foreground whitespace-pre-wrap">
          <RichText value={post.content}/>
        </p>
      </div>

      {/* Image */}
      {post.attachments?.file && (
        <div className="px-4 pb-3">
          <Image
            src={(post.attachments?.file as Media).url??''}
            alt="Post image"
            className="w-full rounded-xl object-cover max-h-96"
          />
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-t border-border">
        <span>{post.likeCount?.toLocaleString()??0} lượt thích</span>
        <div className="flex gap-4">
          <span>{post.commentsCount?.toLocaleString()??0} bình luận</span>
          <span>{post.sharesCount?.toLocaleString()??0} chia sẻ</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 flex items-center justify-around border-t border-border">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors ${
            isLiked ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary' : ''}`} />
          <span className="text-sm font-medium">Thích</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Bình luận</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">Chia sẻ</span>
        </button>
      </div>
    </article>
  );
}
