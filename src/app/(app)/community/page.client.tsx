
'use client';
import { CommunityList } from '@/components/community/CommunityList';
import { PostFeed } from '@/components/community/PostFeed';
import { mockCommunities, mockPosts } from '@/data/communityData';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/Auth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { SocialPost } from '@/payload-types';
import { useEffect, useState } from 'react';
import { Community } from '@/payload-types';

interface CommunityProps {
    communities:Community[];
    recommendCommunities:Community[];
}
export default function CommunityComponent({communities, recommendCommunities}:CommunityProps) {
    const { user } = useAuth()
    const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)
    const { data, status, fetchCollection } = useWebSocket(() => { }, [
        { col: 'socialPosts', limit: 10 },
        { col: 'postLikes', limit: 100, where: { user: { equals: user } } },
        { col: 'comments', limit: 500 },
    ]);

    useEffect(()=>{
        if (!selectedPost) return;
        fetchCollection('comments', {where:{post:{equals:selectedPost}}})
    },[selectedPost, fetchCollection])

    return (
        <div className="min-h-screen bg-background">
            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
                {/* Community List */}
                <CommunityList communities={communities} recommendCommunities={recommendCommunities}/>

                {/* Post Feed */}
                <div>
                    <h2 className="font-semibold text-lg mb-4 text-foreground">Bài đăng mới nhất</h2>
                    <PostFeed posts={data?.socialPosts ?? []} />
                </div>
            </main>
        </div>
    );
}
