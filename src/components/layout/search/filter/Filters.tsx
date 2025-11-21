"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import { areaRanges, priceRanges } from "@/lib/constants";
import { MultiCombobox } from "@/components/ui/multi-select";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProvinces } from "@/endpoints/common/provinces";
import { getDistricts } from "@/endpoints/common/districts";
import { getWards } from "@/endpoints/common/wards";
import { getProperty_types } from "@/endpoints/common/properties";
import { useTransition } from 'react';

export default function Filters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const [districts, setDistricts] = useState<any>([]);
    const [wards, setWards] = useState<any>([]);
    const [property_types, setPropertyTypes] = useState<any>([]);

    const [pendingFilters, setPendingFilters] = useState({
        q: "",
        p_types: [] as string[],
        d: [] as number[],
        w: [] as number[],
        price_ranges: [] as string[],
        area_ranges: [] as string[],
    });

    const fetchDistricts = async () => {
        const districts = await getDistricts()
        setDistricts(districts)
    }
    const fetchWards = async () => {
        const wards = await getWards({ district_code: pendingFilters.d })
        setWards(wards)
    }

    const fetchProperties = async () => {
        const properties = await getProperty_types()
        setPropertyTypes(properties)
    }
    useEffect(() => {
        fetchDistricts()
        fetchProperties()
    }, []);

    useEffect(() => {
        fetchWards()
    }, [pendingFilters.d]);

    useEffect(() => {
        const priceMin = Number(searchParams.get("price_min"));
        const priceMax = Number(searchParams.get("price_max"));
        const areaMin = Number(searchParams.get("area_min"));
        const areaMax = Number(searchParams.get("area_max"));

        // ✅ tìm range theo min-max
        const matchedPriceRanges = priceRanges
            .filter(
                (p) =>
                    (p.min === priceMin) ||
                    (p.max === priceMax) ||
                    (p.min === priceMin && p.max === priceMax)
            )
            .map((p) => p.label);

        const matchedAreaRanges = areaRanges
            .filter(
                (a) =>
                    (a.min === areaMin) ||
                    (a.max === areaMax) ||
                    (a.min === areaMin && a.max === areaMax)
            )
            .map((a) => a.label);

        setPendingFilters({
            q: searchParams.get("q") || "",
            p_types: searchParams.get("p_types")?.split(",") || [],
            d: searchParams.get("d")?.split(",").map(Number) || [],
            w: searchParams.get("w")?.split(",").map(Number) || [],
            price_ranges: matchedPriceRanges,
            area_ranges: matchedAreaRanges,
        });
    }, [searchParams]);

    const handleChange = (key: keyof typeof pendingFilters, values: any) => {
        setPendingFilters((prev) => ({ ...prev, [key]: values }));
    };

    const handleApply = () => {
        const params = new URLSearchParams();

        if (pendingFilters.q.trim()) params.set("q", pendingFilters.q.trim());
        if (pendingFilters.p_types.length)
            params.set("p_types", pendingFilters.p_types.join(","));
        if (pendingFilters.d.length) params.set("d", pendingFilters.d.join(","));
        if (pendingFilters.w.length) params.set("w", pendingFilters.w.join(","));

        // 🎯 Khoảng giá
        if (pendingFilters.price_ranges.length > 0) {
            const selected = pendingFilters.price_ranges
                .map((label) => priceRanges.find((p) => p.label === label))
                .filter(Boolean);
            const min = Math.min(
                ...selected.map((p) => p?.min ?? 0).filter((v) => v !== null)
            );
            const maxValues = selected.map((p) => p?.max).filter((v) => v !== null);
            const max = maxValues.length ? Math.max(...(maxValues as number[])) : null;

            if (!isNaN(min) && min > 0) params.set("price_min", String(min));
            if (max !== null && !isNaN(max)) params.set("price_max", String(max));
        }

        // 🎯 Khoảng diện tích
        if (pendingFilters.area_ranges.length > 0) {
            const selected = pendingFilters.area_ranges
                .map((label) => areaRanges.find((a) => a.label === label))
                .filter(Boolean);
            const min = Math.min(
                ...selected.map((a) => a?.min ?? 0).filter((v) => v !== null)
            );
            const maxValues = selected.map((a) => a?.max).filter((v) => v !== null);
            const max = maxValues.length ? Math.max(...(maxValues as number[])) : null;

            if (!isNaN(min) && min > 0) params.set("area_min", String(min));
            if (max !== null && !isNaN(max)) params.set("area_max", String(max));
        }
        const newUrl = `${pathname}?${params.toString()}`;
        startTransition(() => {
            router.push(newUrl, { scroll: false });
            // router.refresh() is often unnecessary here as router.push triggers a re-render
        });
    };

    const handleReset = () => {
        setPendingFilters({
            q: "",
            p_types: [],
            d: [],
            w: [],
            price_ranges: [],
            area_ranges: [],
        });
        const newUrl = pathname;

        // ✅ Bọc trong startTransition
        startTransition(() => {
            router.push(newUrl, { scroll: false });
            router.refresh();
        });
    };

    return (
        <Card className="p-4 space-y-6">
            <h3 className="font-semibold text-lg">Tìm kiếm theo nhu cầu</h3>

            {/* ===================== TÌM KIẾM ===================== */}
            <div className="lg:hidden block">
                <label className="text-sm font-medium block">Tìm kiếm</label>
                <Input
                    placeholder="Tìm kiếm..."
                    value={pendingFilters.q}
                    onChange={(e) => handleChange("q", e.target.value)}
                />
            </div>

            {/* ===================== LOẠI BẤT ĐỘNG SẢN ===================== */}
            <div>
                <label className="text-sm font-medium block">Loại bất động sản</label>
                <MultiCombobox
                    placeholder="Chọn loại bất động sản"
                    className="w-full"
                    options={property_types.map((p: any) => ({
                        value: p.value,
                        label: p.label,
                    }))}
                    value={pendingFilters.p_types}
                    onChange={(values) => handleChange("p_types", values)}
                />
            </div>

            {/* ===================== QUẬN HUYỆN ===================== */}
            <div>
                <label className="text-sm font-medium block">Quận huyện</label>
                <MultiCombobox
                    placeholder="Chọn quận huyện"
                    className="w-full"
                    options={districts.map((d: any) => ({
                        value: d.code,
                        label: d.name,
                    }))}
                    value={pendingFilters.d}
                    onChange={(values) => handleChange("d", values)}
                />
            </div>

            {/* ===================== PHƯỜNG XA ===================== */}
            <div>
                <label className="text-sm font-medium block">Phường xã</label>
                <MultiCombobox
                    disabled={pendingFilters.d.length === 0}
                    placeholder="Chọn phường xã"
                    className="w-full"
                    options={wards.map((w: any) => ({
                        value: w.code,
                        label: w.name + " - " + w.district.name,
                    }))}
                    value={pendingFilters.w}
                    onChange={(values) => handleChange("w", values)}
                />
            </div>

            {/* ===================== GIÁ ===================== */}
            <div>
                <label className="text-sm font-medium block">Khoảng giá</label>
                <MultiCombobox
                    placeholder="Chọn khoảng giá"
                    className="w-full"
                    options={priceRanges.map((p) => ({
                        value: p.label,
                        label: p.label,
                    }))}
                    value={pendingFilters.price_ranges}
                    onChange={(values) => handleChange("price_ranges", values)}
                />
            </div>

            {/* ===================== DIỆN TÍCH ===================== */}
            <div>
                <label className="text-sm font-medium block">Diện tích</label>
                <MultiCombobox
                    placeholder="Chọn khoảng diện tích"
                    className="w-full"
                    options={areaRanges.map((a) => ({
                        value: a.label,
                        label: a.label,
                    }))}
                    value={pendingFilters.area_ranges}
                    onChange={(values) => handleChange("area_ranges", values)}
                />
            </div>

            {/* ===================== ACTION ===================== */}
            <div className="flex gap-2 items-center">
                <Button onClick={handleApply} disabled={isPending}>
                    {isPending ? 'Đang áp dụng...' : 'Áp dụng bộ lọc'}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                    Xóa bộ lọc
                </Button>
            </div>
        </Card>
    );
}
