// src/app/[slug]/PropertyDetailClient.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Bed, Bath, Square, MapPin, Phone, Share2, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import PropertyCard from './PropertyCard'
import { formatPrice, getMediaBlurUrl, getMediaUrl, getValue } from '@/lib/utils'
import { Property } from '@/payload-types'
import { RichText } from '../RichText'

type PropertyDetailClientProps = {
    property: Property
    wardStats: any
    relatedProperties: Property[]
}

export default function PropertyDetailClient({
    property,
    wardStats,
    relatedProperties,
}: PropertyDetailClientProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [showAllWards, setShowAllWards] = useState(false)
    // === THAY ĐỔI: Tách Dialog ra ngoài, chỉ mở khi click ảnh chính ===
    const [isImageOpen, setIsImageOpen] = useState(false)
    const router = useRouter()

    const pricePerSqm = Math.round(property.price / property.area / 1_000_000)

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % (property.images?.length || 0))
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + (property.images?.length || 0)) % (property.images?.length || 0))
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button onClick={() => router.push('/')} variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Share2 className="w-4 h-4 mr-2" /> Chia sẻ
                            </Button>
                            <Button variant="outline" size="sm">
                                <Heart className="w-4 h-4 mr-2" /> Lưu
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Gallery */}
                        <Card className="overflow-hidden">
                            <div className="relative bg-muted">
                                {/* === ẢNH CHÍNH - CLICK ĐỂ PHÓNG TO === */}
                                <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
                                    <DialogTrigger asChild>
                                        <button className="relative w-full h-full cursor-zoom-in">
                                            <Image
                                                width={1000}
                                                height={1000}
                                                src={getMediaUrl(property.images?.[currentImageIndex].image) || ""}
                                                alt={property.title}
                                                className="aspect-video w-full h-full object-cover"
                                                blurDataURL={getMediaBlurUrl(property.images?.[currentImageIndex].image) || ""}
                                            />
                                            {property.featured && (
                                                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                                                    VIP
                                                </Badge>
                                            )}
                                        </button>
                                    </DialogTrigger>

                                    {/* === DIALOG PHÓNG TO === */}
                                    <DialogContent
                                        className="p-0 w-screen h-screen max-w-none max-h-none m-0 rounded-none overflow-hidden"
                                        onOpenAutoFocus={(e) => e.preventDefault()}
                                    >
                                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                                            {/* ẢNH TO NHẤT CÓ THỂ */}
                                            <Image
                                                src={getMediaUrl(property.images?.[currentImageIndex].image) || ""}
                                                alt={property.title}
                                                fill
                                                className="object-contain"
                                                priority
                                                placeholder="blur"
                                                blurDataURL={getMediaBlurUrl(property.images?.[currentImageIndex].image) || ""}
                                            />

                                            {/* NÚT PREV */}
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    prevImage()
                                                }}
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </Button>

                                            {/* NÚT NEXT */}
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    nextImage()
                                                }}
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </Button>

                                            {/* NÚT ĐÓNG */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-4 right-4 bg-white/90 hover:bg-white z-10"
                                                onClick={() => setIsImageOpen(false)}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </Button>

                                            {/* DOT INDICATOR */}
                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-4 py-2 rounded-full z-10">
                                                {property.images?.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-8' : 'bg-white/60'
                                                            }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setCurrentImageIndex(i)
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {/* === NÚT PREV/NEXT TRÊN ẢNH CHÍNH === */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        prevImage()
                                    }}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        nextImage()
                                    }}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>

                                {/* === DOT INDICATOR === */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {property.images?.map((_, i) => (
                                        <button
                                            key={i}
                                            className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setCurrentImageIndex(i)
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* === DANH SÁCH ẢNH NHỎ DƯỚI - CHỈ ĐỔI ẢNH CHÍNH, KHÔNG MỞ DIALOG === */}
                            <div className="p-4 grid grid-cols-4 gap-2">
                                {property.images?.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentImageIndex(i)}
                                        className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIndex
                                            ? 'border-primary ring-2 ring-primary/20'
                                            : 'border-transparent hover:border-muted-foreground'
                                            }`}
                                    >
                                        <Image
                                            width={300}
                                            height={300}
                                            src={getMediaUrl(img.image)}
                                            alt=""
                                            placeholder="blur"
                                            blurDataURL={getMediaBlurUrl(img.image) || ""}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Info */}
                        <Card className="p-6">
                            <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="text-4xl font-bold text-accent">{formatPrice(property.price)}</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-xl text-muted-foreground">{pricePerSqm} tr/m²</span>
                            </div>

                            <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                                {property.bedrooms && (
                                    <div className="flex items-center gap-2">
                                        <Bed className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-lg">{property.bedrooms} PN</span>
                                    </div>
                                )}
                                {property.bathrooms && (
                                    <div className="flex items-center gap-2">
                                        <Bath className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-lg">{property.bathrooms} PT</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Square className="w-5 h-5 text-muted-foreground" />
                                    <span className="text-lg">{property.area} m²</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 mb-6">
                                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">{property.address}</p>
                                    <p className="text-muted-foreground">
                                        {getValue(property.district, 'name')}, {getValue(property.province, 'name')}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold mb-3">Mô tả</h2>
                                {property.description && <RichText className="property_richtext" enableGutter={false} enableProse={false} data={property.description} />}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-24">
                            <h3 className="text-lg font-semibold mb-4">Người bán</h3>
                            <div className="flex items-center gap-3 mb-6">
                                <Image
                                    width={500}
                                    height={500}
                                    src={getMediaUrl(getValue(property.seller, 'avatar')) || '/default-avatar.png'}
                                    alt={getValue(property.seller, 'name')}
                                    placeholder="blur"
                                    blurDataURL={getMediaBlurUrl(getValue(property.seller, 'avatar')) || '/default-avatar.png'}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-semibold text-lg">{getValue(property.seller, 'name')}</p>
                                    <p className="text-sm text-muted-foreground">Môi giới</p>
                                </div>
                            </div>

                            {getValue(property.seller, 'phone') && (
                                <>
                                    <Button
                                        className="w-full mb-2"
                                        size="lg"
                                        onClick={() => window.open(`tel:${getValue(property.seller, 'phone')}`)}
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        {getValue(property.seller, 'phone')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        size="lg"
                                        onClick={() => window.open(`https://zalo.me/${getValue(property.seller, 'phone')}`)}
                                    >
                                        <Image width={500} height={500} src="/zalo-icon.webp" alt="" className="w-5 h-5 mr-2" />
                                        Chat Zalo
                                    </Button>
                                </>
                            )}

                            <div className="mt-6 pt-6 border-t text-sm text-muted-foreground">
                                <p>Ngày đăng: {new Date(getValue(property, 'created_at')).toLocaleDateString('vi-VN')}</p>
                                <p>Mã tin: {getValue(property, 'id')}</p>
                            </div>

                            {/* Ward List */}
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-semibold mb-3">Phường tại {getValue(property.district, 'name')}</h4>
                                <div className={`space-y-1 ${showAllWards ? '' : 'max-h-80 overflow-y-hidden'}`}>
                                    {wardStats.map((ward: any) => (
                                        <button
                                            key={ward.code}
                                            onClick={() => router.push(`/?d=${getValue(property.district, 'code')}&w=${ward.code}`)}
                                            className="w-full text-left px-3 py-1.5 hover:bg-muted rounded text-sm flex justify-between"
                                        >
                                            <span>{ward.name}</span>
                                            <span className="text-muted-foreground">({ward.propertyCount})</span>
                                        </button>
                                    ))}
                                </div>
                                {wardStats.length > 10 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() => setShowAllWards(!showAllWards)}
                                    >
                                        {showAllWards ? 'Thu gọn' : 'Xem thêm'}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Related */}
                {relatedProperties.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-6">Tin dành cho bạn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {relatedProperties.map((p) => (
                                <PropertyCard key={p.id} property={p} variant="vertical" />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}