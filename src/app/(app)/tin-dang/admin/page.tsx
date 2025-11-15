'use client';

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, Upload, Undo2, Download, Plus, Diamond } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/payload-types";
import { Search } from "@/components/Search";
import {
  bumpProperty,
  getPropertiesByStatus,
  restoreProperty,
  softDeleteProperty,
  togglePublish,
  updateVipStatus,
} from "@/endpoints/common/properties";
import { useRouter } from "next/navigation";

type StatusFilter = "published" | "unpublished" | "deleted" | "expired" | "expiring" | undefined;

interface Stats {
  total: number;
  published: number;
  unpublished: number;
  deleted: number;
  expired: number;
  expiring: number;
  bumped_today: number;
  never_bumped: number;
}

export default function Admin() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>(undefined);
  const [properties, setProperties] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    unpublished: 0,
    deleted: 0,
    expired: 0,
    expiring: 0,
    bumped_today: 0,
    never_bumped: 0,
  });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // === LOAD DATA ===
  useEffect(() => {
    startTransition(async () => {
      const data = await getPropertiesByStatus({ status: activeFilter });
      setProperties(data.list);
      setStats(data.stats);
    });
  }, [activeFilter]);

  // === UTILS ===
  const formatPrice = (price: number) =>
    price >= 1_000_000_000
      ? `${(price / 1_000_000_000).toFixed(1)} tỷ`
      : `${(price / 1_000_000).toFixed(0)} triệu`;

  const getMediaUrl = (image: any) => {
    if (!image?.image?.url) return "/placeholder.jpg";
    // Payload trả về url tương đối → thêm base URL nếu cần
    return image.image.url.startsWith("http") ? image.image.url : `${process.env.NEXT_PUBLIC_PAYLOAD_URL}${image.image.url}`;
  };

  const isExpired = (property: Property) => {
    if (!property.expire_at) return false;
    return new Date(property.expire_at) < new Date();
  };

  const getStatus = (property: Property) => {
    if (property.is_hidden) return { label: "Đã xóa", color: "bg-gray-200 text-gray-700" };
    if (isExpired(property)) return { label: "Hết hạn", color: "bg-red-100 text-red-700" };
    if (!property.is_published) return { label: "Đã hạ", color: "bg-orange-100 text-orange-700" };

    const expireAt = property.expire_at ? new Date(property.expire_at) : null;
    if (expireAt) {
      const diffDays = Math.floor((expireAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3 && diffDays >= 0)
        return { label: "Sắp hết hạn", color: "bg-yellow-100 text-yellow-800" };
    }

    return { label: "Đang hiển thị", color: "bg-green-100 text-green-700" };
  };

  // === ACTIONS ===
  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    const res = await togglePublish(id, isPublished);
    if (res.success) {
      toast.success(isPublished ? "Tin đã được hạ xuống!" : "Tin đã được đăng lại!");
      startTransition(() => getPropertiesByStatus({ status: activeFilter }).then(d => {
        setProperties(d.list);
        setStats(d.stats);
      }));
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await softDeleteProperty(id);
    if (res.success) {
      toast.success("Tin đã chuyển vào thùng rác");
      startTransition(() => getPropertiesByStatus({ status: activeFilter }).then(d => {
        setProperties(d.list);
        setStats(d.stats);
      }));
    }
  };

  const handleRestore = async (id: string) => {
    const res = await restoreProperty(id);
    if (res.success) {
      toast.success("Tin đã được khôi phục");
      startTransition(() => getPropertiesByStatus({ status: activeFilter }).then(d => {
        setProperties(d.list);
        setStats(d.stats);
      }));
    }
  };

  const handleBump = async (property: Property) => {
    const now = Date.now();
    const lastBumped = property.last_bumped_at ? new Date(property.last_bumped_at).getTime() : 0;

    if (lastBumped && now - lastBumped < 8 * 60 * 60 * 1000) {
      const remaining = Math.ceil((8 * 60 * 60 * 1000 - (now - lastBumped)) / (60 * 60 * 1000));
      toast.warning(`Bạn có thể đẩy lại sau ${remaining} giờ`);
      return;
    }

    const res = await bumpProperty(property.id);
    if (res.success) {
      toast.success("Tin đã được đẩy lên đầu!");
      startTransition(() => getPropertiesByStatus({ status: activeFilter }).then(d => {
        setProperties(d.list);
        setStats(d.stats);
      }));
    } else {
      toast.error("Lỗi khi đẩy tin");
    }
  };

  const handleBumpVip = async (property: Property) => {
    const now = Date.now();
    const activated = property.vip_activated_at ? new Date(property.vip_activated_at).getTime() : 0;

    if (activated && now - activated < 8 * 60 * 60 * 1000) {
      const remaining = Math.ceil((8 * 60 * 60 * 1000 - (now - activated)) / (60 * 60 * 1000));
      toast.warning(`VIP chỉ đẩy được sau ${remaining} giờ`);
      return;
    }

    const res = await updateVipStatus(property.id, 7, true);
    if (res.success) {
      toast.success("Tin đã được đẩy VIP 7 ngày!");
      startTransition(() => getPropertiesByStatus({ status: activeFilter }).then(d => {
        setProperties(d.list);
        setStats(d.stats);
      }));
    }
  };

  console.log(properties)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Quản lý Bất động sản</h1>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={activeFilter === undefined ? "default" : "outline"}
              onClick={() => setActiveFilter(undefined)}
              className="rounded-full text-sm"
            >
              Tất cả ({stats.total})
            </Button>
            <Button
              variant={activeFilter === "published" ? "default" : "outline"}
              onClick={() => setActiveFilter("published")}
              className="rounded-full text-sm"
            >
              Đang hiển thị ({stats.published})
            </Button>
            <Button
              variant={activeFilter === "unpublished" ? "default" : "outline"}
              onClick={() => setActiveFilter("unpublished")}
              className="rounded-full text-sm"
            >
              Đã hạ ({stats.unpublished})
            </Button>
            <Button
              variant={activeFilter === "deleted" ? "default" : "outline"}
              onClick={() => setActiveFilter("deleted")}
              className="rounded-full text-sm"
            >
              Đã xóa ({stats.deleted})
            </Button>
            <Button
              variant={activeFilter === "expired" ? "default" : "outline"}
              onClick={() => setActiveFilter("expired")}
              className="rounded-full text-sm"
            >
              Hết hạn ({stats.expired})
            </Button>
            <Button
              variant={activeFilter === "expiring" ? "default" : "outline"}
              onClick={() => setActiveFilter("expiring")}
              className="rounded-full text-sm"
            >
              Sắp hết hạn ({stats.expiring})
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              variant="default"
              size="lg"
              className="bg-accent hover:bg-primary"
              onClick={() => router.push('/property/add')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Đăng tin mới
            </Button>
          </div>
        </div>
      </header>

      {/* Property List */}
      <div className="container mx-auto px-4 py-6">
        <p className="text-muted-foreground mb-4">
          Hiển thị: <strong>{properties.length}</strong> tin
        </p>

        {isPending ? (
          <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có tin nào trong mục này.
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <Card key={property.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <Image
                      src={property.images?.[0].image.url}
                      alt={property.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                    {property.is_vip && (
                      <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                        VIP
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div
                    className="flex-1 cursor-pointer group"
                    onClick={() => router.push(`/property/${property.id}`)}
                  >
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary line-clamp-1">
                      {property.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${getStatus(property).color}`}>
                        {getStatus(property).label}
                      </span>
                    </div>

                    <div className="flex gap-4 text-sm text-muted-foreground mb-1">
                      <span className="text-accent font-semibold text-base">
                        {formatPrice(property.price)}
                      </span>
                      <span>· {property.area} m²</span>
                      {property.bedrooms && <span>· {property.bedrooms} PN</span>}
                      {property.bathrooms && <span>· {property.bathrooms} PT</span>}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {property.address}, {property.ward?.name && `${property.ward.name}, `}{property.district?.name}, {property.province?.name}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!property.is_hidden && property.is_published && !isExpired(property) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBump(property);
                          }}
                          disabled={isPending}
                        >
                          <Upload className="w-4 h-4 mr-1" /> Đẩy tin
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBumpVip(property);
                          }}
                          disabled={isPending}
                        >
                          <Diamond className="w-4 h-4 mr-1" /> VIP 7 ngày
                        </Button>
                      </>
                    )}

                    {!property.is_hidden && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublish(property.id, property.is_published || false);
                        }}
                        disabled={isPending}
                      >
                        {property.is_published && !isExpired(property) ? (
                          <>
                            <Download className="w-4 h-4 mr-1" /> Hạ tin
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-1" /> Đăng lại
                          </>
                        )}
                      </Button>
                    )}

                    {!property.is_hidden ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(property.id);
                        }}
                        className="text-destructive border-destructive"
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Xóa
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(property.id);
                        }}
                        disabled={isPending}
                      >
                        <Undo2 className="w-4 h-4 mr-1" /> Khôi phục
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}