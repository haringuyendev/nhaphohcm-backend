import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Users = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Thêm tài khoản
        </Button>
      </div>
      
      <Card className="p-6">
        <p className="text-muted-foreground">
          Chức năng quản lý tài khoản đang được phát triển...
        </p>
      </Card>
    </div>
  );
};

export default Users;
