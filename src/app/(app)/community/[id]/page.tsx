'use client';
import { mockCommunities, mockPosts } from '@/data/communityData';
import { PostFeed } from '@/components/community/PostFeed';
import { ArrowLeft, Users, FileText, UserPlus, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function CommunityDetail() {
  const params = useParams();
  const id = params.id;
  const community = mockCommunities.find(c => c.id === id);
  const communityPosts = mockPosts.filter(p => p.communityId === id);
  
  const [isJoined, setIsJoined] = useState(community?.isJoined ?? false);

  if (!community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Không tìm thấy cộng đồng</p>
          <Link href="/community" className="text-primary hover:underline mt-2 inline-block">
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link 
            href="/community"
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground truncate">{community.name}</h1>
        </div>
      </header>

      {/* Cover & Info */}
      <div className="relative">
        <div className="h-40 overflow-hidden">
          <Image 
            width={1000}
            height={1000}
            src={community.coverImage}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative -mt-12 flex items-end gap-4">
            <Image 
              width={100}
              height={100}
              src={community.avatar}
              alt={community.name}
              className="w-24 h-24 rounded-xl border-4 border-card object-cover"
            />
            <div className="flex-1 pb-2">
              <h2 className="text-xl font-bold text-foreground">{community.name}</h2>
            </div>
          </div>
          <p className="mt-3 text-muted-foreground">{community.description}</p>
          
          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{community.membersCount.toLocaleString()} thành viên</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>{community.postsCount.toLocaleString()} bài đăng</span>
            </div>
          </div>

          {/* Join Button */}
          <button
            onClick={() => setIsJoined(!isJoined)}
            className={`mt-4 w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
              isJoined 
                ? 'bg-muted text-foreground hover:bg-muted/80' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isJoined ? (
              <>
                <UserCheck className="w-5 h-5" />
                Đã tham gia
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Tham gia
              </>
            )}
          </button>
        </div>
      </div>

      {/* Posts */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h3 className="font-semibold text-lg mb-4 text-foreground">Bài đăng</h3>
        {communityPosts.length > 0 ? (
          <PostFeed posts={communityPosts}  />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Chưa có bài đăng nào trong cộng đồng này
          </div>
        )}
      </main>
    </div>
  );
}
