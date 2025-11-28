import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, SearchX } from "lucide-react";
import Link from "next/link";
import { Reason } from "@/data/common";

const NotFoundComponent = ({reason}: {reason: Reason}) => {
  const messages = {
    [Reason.NOT_FOUND]: {
      title: "Không tìm thấy tin đăng",
      description: "Tin đăng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
    },
    [Reason.EXPIRED]: {
      title: "Tin đăng đã hết hạn",
      description: "Tin đăng này đã hết hạn hiển thị. Vui lòng tìm kiếm tin đăng khác."
    },
    [Reason.HIDDEN]: {
      title: "Tin đăng đã bị ẩn",
      description: "Tin đăng này đang tạm ẩn và không thể xem được."
    }
  };

  const message = messages[reason as keyof typeof messages] || messages[Reason.NOT_FOUND];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="max-w-md w-full mx-4 p-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <SearchX className="w-10 h-10 text-muted-foreground" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-3">{message.title}</h1>
          <p className="text-muted-foreground mb-6">
            {message.description}
          </p>
          
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full" size="lg">
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

export default NotFoundComponent;
