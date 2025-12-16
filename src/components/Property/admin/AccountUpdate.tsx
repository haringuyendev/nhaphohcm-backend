// components/Account.tsx (hoặc app/account/AccountClient.tsx)
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia } from "@/endpoints/media";
import { updateProfileAction } from "@/endpoints/user";
import { User } from "@/payload-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, User as UserIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Zod schema
const profileSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface AccountProps {
  user: User;
}

export default function Account({ user }: AccountProps) {
  const initialAvatarUrl = typeof user.avatar === "string" 
    ? user.avatar 
    : user.avatar?.url || "/avatar-placeholder.jpg";

  const [avatarPreview, setAvatarPreview] = useState<string>(initialAvatarUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được lớn hơn 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);

    try {
      let avatarId: string | undefined;

      if (selectedFile) {
        const uploadRes = await uploadMedia(selectedFile);

        if (!uploadRes?.success || !uploadRes.id) {
          throw new Error(uploadRes?.error || "Upload ảnh thất bại");
        }

        avatarId = uploadRes.id;
        toast.success("Đã tải ảnh đại diện mới");
      }

      const result = await updateProfileAction({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        avatar: avatarId, // undefined = không thay đổi avatar
        user:user.id
      });

      if (!result.success) {
        throw new Error(result.error || "Cập nhật thất bại");
      }

      toast.success("Cập nhật thông tin thành công!");

      // Reset form + file input
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Nếu upload thành công → cập nhật preview thành URL thật (tùy chọn)
      // Có thể refetch user ở đây nếu cần

    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Thông tin tài khoản</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <Label className="text-base">Ảnh đại diện</Label>
            <div className="mt-4 relative group">
              <Avatar className="w-32 h-32 ring-4 ring-background shadow-xl">
                <AvatarImage src={avatarPreview} alt="Avatar" />
                <AvatarFallback className="bg-muted">
                  <UserIcon className="w-16 h-16 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>

              <label
                htmlFor="avatar"
                className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <Upload className="w-8 h-8 text-white" />
                <span className="sr-only">Thay đổi ảnh</span>
              </label>

              <input
                ref={fileInputRef}
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Nhấp để thay đổi ảnh (tối đa 5MB)
            </p>
          </div>

          {/* Form fields */}
          <div className="space-y-5">
            <div>
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                {...register("name")}
                disabled={isSubmitting}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email")}
                type="email"
                disabled={isSubmitting}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                {...register("phone")}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || (!isDirty && !selectedFile)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              "Cập nhật thông tin"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}