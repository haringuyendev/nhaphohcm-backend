'use client'

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Mail, Lock, Loader2 } from "lucide-react"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation" // ĐÃ SỬA: App Router dùng next/navigation, không phải next/router
import Link from "next/link"
import { useAuth } from '@/providers/Auth'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod" // ĐÃ SỬA: import đúng

// Schema + Type
const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
})

type LoginFormData = z.infer<typeof loginSchema>

const Login = () => {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false) // Thêm state loading riêng

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), // ĐÃ SỬA: thêm resolver
    mode: "onBlur",
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data) // Gọi hàm login từ Auth context
      toast.success("Đăng nhập thành công!")
      router.push("/admin") // hoặc "/" tùy bạn
    } catch (error: any) {
      console.error("Login error:", error)
      toast.error(error?.message || "Email hoặc mật khẩu không đúng")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50 backdrop-blur-sm bg-card/95 p-4">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Đăng Nhập
          </CardTitle>
          <CardDescription className="text-base">
            Đăng nhập để quản lý tin đăng bất động sản của bạn
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                  className="pl-10 h-11"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-10 h-11"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isLoading || isSubmitting}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>

            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Hoặc</span>
              </div>
            </div> */}

          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login