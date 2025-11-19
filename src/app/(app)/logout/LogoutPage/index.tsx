'use client';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, LogIn, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/Auth";

const Logout = () => {
  const { logout } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
        setStatus('success')
      } catch (_) {
        setStatus('error')
      }
    }

    void performLogout()
  }, [logout])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50 backdrop-blur-sm bg-card/95">
        <CardContent className="pt-10 pb-8 px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon with animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-2xl opacity-30 animate-pulse"></div>
              {status === 'loading' && (
                <div className="relative bg-primary/10 p-6 rounded-full">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="relative bg-primary/10 p-6 rounded-full animate-in zoom-in-50 duration-500">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
              )}
              {status === 'error' && (
                <div className="relative bg-destructive/10 p-6 rounded-full animate-in zoom-in-50 duration-500">
                  <CheckCircle2 className="h-12 w-12 text-destructive" />
                </div>
              )}
            </div>

            {/* Status Message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {status === 'loading' && 'Đang đăng xuất...'}
                {status === 'success' && 'Đăng xuất thành công'}
                {status === 'error' && 'Bạn đã đăng xuất'}
              </h1>
              <p className="text-muted-foreground text-base">
                {status === 'loading' && 'Vui lòng đợi trong giây lát'}
                {status === 'success' && 'Cảm ơn bạn đã sử dụng dịch vụ đăng tin bất động sản'}
                {status === 'error' && 'Phiên làm việc của bạn đã kết thúc'}
              </p>
            </div>

            {/* Action Buttons */}
            {status !== 'loading' && (
              <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
                <Button 
                  asChild 
                  className="flex-1 bg-gradient-to-r from-primary to-primary-light hover:opacity-90 transition-opacity shadow-md"
                >
                  <Link href="/login" className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Đăng nhập lại
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline"
                  className="flex-1 border-border/80 hover:bg-muted/50 transition-colors"
                >
                  <Link href="/" className="flex items-center justify-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Về trang chủ
                  </Link>
                </Button>
              </div>
            )}

            {/* Additional Info */}
            {status !== 'loading' && (
              <p className="text-sm text-muted-foreground pt-4 animate-in fade-in-50 duration-1000">
                Bạn muốn làm gì tiếp theo?{' '}
                <Link href="/" className="text-primary hover:text-primary-light transition-colors font-medium">
                  Xem tin đăng
                </Link>
                {' hoặc '}
                <Link href="/login" className="text-primary hover:text-primary-light transition-colors font-medium">
                  đăng nhập
                </Link>
                {' để đăng tin mới.'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logout;
