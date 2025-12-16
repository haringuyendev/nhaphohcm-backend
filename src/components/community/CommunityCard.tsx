import { Community, Media } from '@/payload-types';
import { Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Link 
      href={`/community/${community.id}`}
      className="shrink-0 w-40 bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
    >
      <div className="h-16 overflow-hidden">
        <Image 
          src={(community.cover as Media)?.url ?? ''} 
          alt={community.name}
          width={500}
          height={500}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3 -mt-6 relative">
        <Image 
          src={(community.avatar as Media)?.url ?? ''}
          alt={community.name}
          width={100}
          height={100}
          className="w-12 h-12 rounded-full border-2 border-card object-cover"
        />
        <h3 className="font-semibold text-sm mt-2 truncate text-foreground">
          {community.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Users className="w-3 h-3" />
          <span>{community?.memberCount?.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
