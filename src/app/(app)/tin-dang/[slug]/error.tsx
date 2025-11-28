'use client'
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";

const Error = ({ reset }: { reset: () => void }) => {

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="max-w-md w-full mx-4 p-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-3">Đã xảy ra lỗi</h1>
          <p className="text-muted-foreground mb-6">
            Hệ thống đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
          </p>
          
          <div className="space-y-3">
            <Button onClick={reset} className="w-full" size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Tải lại trang
            </Button>
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Error;
