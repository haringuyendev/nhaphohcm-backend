import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, MapPin, Phone, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/payload-types";
import { RichText } from "../RichText";
import { formatPrice, getMediaBlurUrl, getMediaUrl, getValue } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  variant?: "horizontal" | "vertical";
}

const PropertyCard = ({ property, variant = "horizontal" }: PropertyCardProps) => {
  const pricePerSqm = Math.round(property.price / property.area / 1000000);
  const getSellerInfo = (property: Property) => {
    if (property.seller && typeof property.seller === "object") {
      return {
        name: property.seller.name || "Admin",
        phone: property.seller.phone || "0123456789",
        avatar: getMediaUrl(property.seller.avatar) || null,
      };
    }
    return {
      name: "Admin",
      phone: "0123456789",
      avatar: null,
    };
  };

  const { name, phone, avatar } = getSellerInfo(property);
  // Vertical variant for grid display
  if (variant === "vertical") {
    return (
      <Card className="overflow-hidden hover:shadow-lg py-0 transition-all duration-300 border-border">
        <Link href={`/tin-dang/${property.slug}`}>
          <div className="relative h-48 overflow-hidden">
            <Image
              src={getMediaUrl(property.images?.[0].image) || ""}
              alt={property.title}
              width={500}
              height={500}
              priority
              blurDataURL={getMediaBlurUrl(property.images?.[0].image) || ""}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            {property.featured && (
              <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs">
                XÁC THỰC
              </Badge>
            )}
            <Badge className="absolute bottom-2 right-2 bg-black/60 text-white border-0 flex items-center gap-1 text-xs">
              <Camera className="w-3 h-3 shrink-0 mt-0.5" />
              <span>{property.images?.length || 0}</span>
            </Badge>
          </div>
        </Link>

        <div className="p-3 space-y-2">
          <Link href={`/tin-dang/${property.slug}`}>
            <h3 className="font-medium text-lg text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight">
              {property.title}
            </h3>
          </Link>

          <div className="flex items-baseline gap-2 text-sm">
            <span className="text-lg font-bold text-accent">
              {formatPrice(property.price)}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-foreground">
              {property.area} m²
            </span>
          </div>

          <div className="flex items-start gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{getValue(property.district, 'name')}, {getValue(property.province, 'name')}</span>
          </div>

          <p className="text-xs text-muted-foreground">Đăng hôm nay</p>
        </div>
      </Card>
    );
  }

  // Horizontal variant (default)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border">
      {/* Image Gallery Grid */}
      <Link href={`/tin-dang/${property.slug}`}>
        <div className="relative h-64 flex gap-1">
          {/* Main Image */}
          <div className="relative flex-[3] overflow-hidden">
            {property.is_vip && (
              <Badge className="absolute top-3 left-3 z-1 bg-accent text-accent-foreground">
               Tin VIP
              </Badge>
            )}
            <Image
              src={getMediaUrl(property.images?.[0].image) || ""}
              alt={property.title}
              width={500}
              height={500}
              priority
              blurDataURL={getMediaBlurUrl(property.images?.[0].image) || ""}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Thumbnail Grid */}
          <div className="flex-[2] flex flex-col gap-1">
            {property.images?.slice(1, 4).map((image:any, index:any) => (
              <div
                key={index}
                className="relative flex-1 overflow-hidden bg-muted"
              >
                <Image
                  src={image.image.url}
                  alt={`${property.title} ${index + 2}`}
                  width={500}
                  height={500}
                  priority
                  blurDataURL={getMediaBlurUrl(image.image) || ""}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                {/* Show total count on last thumbnail */}
                {index === 2&& property?.images && property?.images?.length > 4 && (
                  <Badge className="absolute bottom-2 right-2 bg-black/60 text-white border-0 flex items-center gap-1">
                    <span>📷</span>
                    <span>{property.images?.length}</span>
                  </Badge>
                )}
              </div>
            ))}
            {/* Fill empty slots if less than 3 images */}
            {property?.images && property.images?.length < 4 &&
              Array.from({ length: 4 - property.images?.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex-1 bg-muted"
                />
              ))}
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        <Link href={`/tin-dang/${property.slug}`}>
          <h3 className="font-semibold text-xl text-foreground hover:text-primary transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 flex-wrap text-sm">
          <span className="text-xl font-bold text-accent">
            {formatPrice(property.price)}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground font-semibold">
            {property.area} m²
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {pricePerSqm} tr/m²
          </span>
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {property.description && <RichText enableGutter={false} enableProse={false} data={property.description} />}
        </p>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="line-clamp-1">{property.address? property.address + ", " : ""} {getValue(property.district, 'name')? getValue(property.district, 'name') + ", " : ""} {getValue(property.province, 'name')? getValue(property.province, 'name') : ""}</span>
        </div>

        {/* Seller Info Section */}
        <div className="pt-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={avatar || ""}
              alt={name || "Avatar"}
              width={50}
              height={50}
              className="w-9 h-9 rounded-full"
            />
            <div>
              <p className="font-medium text-sm text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">Đăng hôm nay</p>
            </div>
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Phone className="w-3 h-3 mr-1" />
            {phone}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;
