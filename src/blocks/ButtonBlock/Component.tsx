'use client';
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ButtonBlock as ButtonBlockProps } from '@/payload-types'
import Image from 'next/image'
import { getMediaUrl, getMediaBlurUrl } from "@/lib/utils";
import { Media } from "@/payload-types";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ButtonProps {
  icon?: (string | null) | Media;
  title: string;
  link?: string | null;
  id?: string | null;
}

export const ButtonBlockComponent = ({ buttons }: { buttons?: ButtonBlockProps['buttons'] }) => {
  const isMobile = useIsMobile()
  return (
    <div className="flex gap-4 flex-wrap">
      {buttons?.map((button: ButtonProps, index: number) => (
        <Button
          key={button.id || index}
          size={isMobile ? "lg" : "xl"}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          asChild
        >
          {/* Wrap tất cả vào 1 <a> hoặc <Link> */}
          <Link href={button?.link || '#'} className="flex items-center gap-2 no-underline">
            {button?.icon && (
              <Image
                src={getMediaUrl(button.icon)}
                alt={button.title}
                width={24}
                height={24}
                blurDataURL={getMediaBlurUrl(button.icon)}
                className="inline-block mr-2"
              />
            )}
            <span>{button.title}</span>
          </Link>
        </Button>
      ))}
    </div>
  )
}