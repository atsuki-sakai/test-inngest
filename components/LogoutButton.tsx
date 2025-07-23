"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await signOut({
        callbackUrl: '/login',
        redirect: true
      });
      toast.success("ログアウトしました");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("ログアウトに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span className="text-xs">ログアウト</span>
    </Button>
  );
}