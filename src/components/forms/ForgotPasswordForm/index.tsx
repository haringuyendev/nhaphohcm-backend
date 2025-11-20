'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// Schema
const emailSchema = z.object({
  email: z.string().trim().email({ message: "Email không hợp lệ" }).max(255),
})

type EmailFormData = z.infer<typeof emailSchema>

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true)
    setEmail(data.email)

    try {
      const response = await fetch(
        `/api/users/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: data.email }),
        }
      )

      if (response.ok) {
        setIsSuccess(true)
        toast.success("Link đặt lại mật khẩu đã được gửi đến email của bạn!")
      } else {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || "Gửi email thất bại, vui lòng thử lại")
      }
    } catch (err: any) {
      console.error("Forgot password error:", err)
      toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại sau")
      setError("email", { message: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  // Trang thành công
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-primary/5">
        <Card className="w-full max-w-md shadow-xl border-border/50 backdrop-blur-sm bg-card/95">
          <CardContent className="pt-10 pb-8 px-6">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative bg-green-500/10 p-6 rounded-full">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground">
                  Kiểm tra email của bạn
                </h1>
                <p className="text-muted-foreground text-base max-w-sm">
                  Chúng tôi đã gửi link đặt lại mật khẩu đến{" "}
                  <span className="font-semibold text-foreground break-all">{email}</span>
                </p>
              </div>

              <div className="w-full space-y-4 pt-6">
                <Button asChild className="w-full h-12 text-base font-medium">
                  <Link href="/login">
                    Quay lại đăng nhập
                  </Link>
                </Button>

                <p className="text-sm text-muted-foreground">
                  Không nhận được email?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                  >
                    Gửi lại
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Trang nhập email
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <Card className="w-full max-w-md shadow-xl border-border/50 backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="h-9 w-9 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quên Mật Khẩu?
          </CardTitle>
          <CardDescription className="text-base">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                  className="pl-10 h-12 text-base"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi link đặt lại mật khẩu"
              )}
            </Button>

            <Button type="button" variant="ghost" className="w-full h-11" asChild>
              <Link href="/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword