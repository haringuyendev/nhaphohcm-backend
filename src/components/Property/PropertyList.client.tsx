
'use client';
import { useState } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import Filters from "@/components/layout/search/filter/Filters";
import { useFilter } from "@/hooks/use-filter";

export default function PropertyPageClient({ children }: { children: React.ReactNode }) {
    const mainRef = useRef<HTMLDivElement>(null);
    const { filterOpen, setFilterOpen } = useFilter();

    return (
        <div className="min-h-screen bg-background">
            {/* ===== MAIN ===== */}
            <div ref={mainRef} className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="mb-4 lg:hidden block">
                        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                            <SheetContent side="bottom" className="h-[90vh]">
                                <SheetHeader>
                                </SheetHeader>
                                <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)]">
                                    <Filters setFilterOpen={setFilterOpen} />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                    {/* Sidebar filters - CHỈ SỬA TỪ ĐÂY */}
                    <aside className="hidden lg:block lg:col-span-1">
                        {/* Lớp 1: Sticky container – dính vào top */}
                        <div className="sticky top-24 h-screen">
                            {/* Lớp 2: Scroll container – chỉ chịu trách nhiệm cuộn + ẩn scrollbar */}
                            <div className="h-full overflow-y-auto scrollbar-hide pr-2">
                                {/* Nội dung filter – thêm padding để tránh dính sát mép */}
                                <div className="bg-card space-y-6 min-h-[calc(100vh-6rem)]">
                                    <Filters />
                                </div>
                            </div>
                        </div>
                    </aside>
                    {/* ĐẾN ĐÂY */}

                    {/* Main content */}
                    <main className="lg:col-span-3">
                        {children}
                    </main>
                </div>

            </div>
        </div>
    );
}