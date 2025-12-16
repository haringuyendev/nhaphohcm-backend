"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MultiCombobox } from "@/components/ui/multi-select";
import { getDistricts } from "@/endpoints/districts";
import { getProperty_types } from "@/endpoints/properties";
import { getWards } from "@/endpoints/wards";
import { areaRanges, priceRanges } from "@/lib/constants";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function Filters({
    setFilterOpen,
}: {
    setFilterOpen?: (open: boolean) => void;
}) {
    const router = useRouter();
    const pathname = usePathname(); // LẤY URL HIỆN TẠI
    const [isPending, startTransition] = useTransition();

    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [propertyTypes, setPropertyTypes] = useState<any[]>([]);

    const [filters, setFilters] = useState({
        property_type_slug: [] as string[],
        district_slugs: [] as string[],
        ward_slugs: [] as string[],
        price_range_labels: [] as string[],
        area_range_labels: [] as string[],
    });

    // Load data
    useEffect(() => {
        Promise.all([getDistricts(), getProperty_types()]).then(([d, p]) => {
            setDistricts(d);
            setPropertyTypes(p);
        });
    }, []);

    // useEffect ĐỌC URL → HỖ TRỢ MULTI-SELECT (dấu phẩy)
    useEffect(() => {
        if (!pathname || pathname === "/") {
            setFilters({
                property_type_slug: [],
                district_slugs: [],
                ward_slugs: [],
                price_range_labels: [],
                area_range_labels: [],
            });
            return;
        }

        const segments = pathname.split("/").filter(Boolean);

        let property_type_slug = [""];
        const district_slugs: string[] = [];
        const ward_slugs: string[] = [];
        const price_range_labels: string[] = [];
        const area_range_labels: string[] = [];

        for (const seg of segments) {
            const s = seg.toLowerCase();

            if (s.startsWith("mua-ban-")) {
                // eslint-disable-next-line prefer-const
                let cleaned = s.replace("mua-ban-", "");

                // Tách phần loại + vị trí
                const parts = cleaned.split("-tai-");

                // LOẠI
                const propertyTypeSlug = parts[0].split('+'); // ví dụ: can-ho-dich-vu
                if(propertyTypeSlug.includes('bat-dong-san')) property_type_slug = [""];
                else property_type_slug = propertyTypeSlug;

                // VỊ TRÍ (tùy chọn)
                if (parts.length > 1) {
                    const location = parts[1]; // quan-10-phuong-13
                    const locParts = location.split("-");

                    for (let i = 0; i < locParts.length; i++) {
                        const p = locParts[i];

                        // Quận
                        if (p === "quan" && locParts[i + 1]) {
                            district_slugs.push("quan_" + locParts[i + 1]);
                        }
                        // Phường
                        if (p === "phuong" && locParts[i + 1]) {
                            ward_slugs.push("phuong_" + locParts[i + 1]);
                        }
                    }
                }
                continue;
            }

            const priceMatch = s.match(/gia-tu-(\d+)-(\d+)-ty|gia-tren-(\d+)-ty/);
            if (priceMatch) {
                const [_, from, to, above] = priceMatch;

                if (above) {
                    const label = `Trên ${above} tỷ`;
                    const found = priceRanges.find(p => p.label === label);
                    if (found) price_range_labels.push(found.label);
                } else {
                    const label = `${from} - ${to} tỷ`;
                    const found = priceRanges.find(p => p.label.includes(from) && p.label.includes(to));
                    if (found) price_range_labels.push(found.label);
                }
                continue;
            }

            const areaMatch = s.match(/dien-tich-tu-(\d+)-(\d+)-m2|dien-tich-tren-(\d+)-m2/);
            if (areaMatch) {
                const [_, from, to, above] = areaMatch;

                if (above) {
                    const label = `Trên ${above}m²`;
                    const found = areaRanges.find(a => a.label === label);
                    if (found) area_range_labels.push(found.label);
                } else {
                    const label = `${from}-${to}m²`;
                    const found = areaRanges.find(a => a.label === label);
                    if (found) area_range_labels.push(found.label);
                }
            }
        }

        setFilters({
            property_type_slug,
            district_slugs,
            ward_slugs,
            price_range_labels,
            area_range_labels,
        });
    }, [pathname]);

    // Load phường khi chọn quận
    useEffect(() => {
        if (filters.district_slugs.length > 0 && districts.length > 0) {
            getWards({ district_slug: filters.district_slugs }).then(setWards);
        } else {
            setWards([]);
        }
    }, [filters.district_slugs, districts]);

    const update = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    const generateUrl = () => {
        const parts: string[] = [];

        // 1. Loại BĐS — nếu không chọn thì mặc định "nha-dat"
        const baseType = filters.property_type_slug.length>0
            ? filters.property_type_slug.join("+")
            : "bat-dong-san";

        const base = `mua-ban-${baseType}`;

        // 2. PHƯỜNG đứng trước QUẬN
        let locationPart = "";

        const wards = filters.ward_slugs.map(s => s.replace("phuong_", ""));
        const districts = filters.district_slugs.map(s => s.replace("quan_", ""));

        if (wards.length > 0) {
            // Có phường
            locationPart =
                "tai-" +
                wards.map(w => `phuong-${w}`).join("-") +
                (districts.length > 0 ? "-" + districts.map(d => `quan-${d}`).join("-") : "");
        } else {
            // Không có phường → chỉ có quận
            if (districts.length > 0) {
                locationPart = "tai-" + districts.map(d => `quan-${d}`).join("-");
            }
        }

        // GHÉP LOẠI + POSITION
        const combined = [base, locationPart].filter(Boolean).join("-");
        if (combined) parts.push(combined);

        // 3. Giá
        if (filters.price_range_labels.length > 0) {
            const selected = filters.price_range_labels
                .map(l => priceRanges.find(p => p.label === l))
                .filter(Boolean);

            if (selected.length > 0) {
                const min = Math.min(...selected.map(p => p!.min / 1e9));
                const maxVals = selected.map(p => p!.max).filter((v): v is number => v != null);
                const max = maxVals.length > 0 ? Math.max(...maxVals.map(v => v / 1e9)) : Infinity;

                if (max === Infinity) {
                    parts.push(`gia-tren-${min}-ty`);
                } else {
                    parts.push(`gia-tu-${min}-${max}-ty`);
                }
            }
        }

        // 4. Diện tích
        if (filters.area_range_labels.length > 0) {
            const selected = filters.area_range_labels
                .map(l => areaRanges.find(a => a.label === l))
                .filter(Boolean);

            if (selected.length > 0) {
                const min = Math.min(...selected.map(a => a!.min!));
                const maxVals = selected.map(a => a!.max).filter((v): v is number => v != null);
                const max = maxVals.length > 0 ? Math.max(...maxVals) : Infinity;

                if (max === Infinity) {
                    parts.push(`dien-tich-tren-${min}-m2`);
                } else {
                    parts.push(`dien-tich-tu-${min}-${max}-m2`);
                }
            }
        }

        return "/" + parts.join("/");
    };

    const handleApply = () => {
        const url = generateUrl();
        startTransition(() => {
            router.push(url, { scroll: false });
        });
        setFilterOpen?.(false);
    };

    const handleReset = () => {
        setFilters({
            property_type_slug: [],
            district_slugs: [],
            ward_slugs: [],
            price_range_labels: [],
            area_range_labels: [],
        });
        startTransition(() => {
            router.push("/");
        });
        setFilterOpen?.(false);
    };

    return (
        <Card className="p-4 space-y-6">
            <h3 className="font-semibold text-lg">Tìm kiếm theo nhu cầu</h3>

            <div>
                <label className="text-sm font-medium block">Loại bất động sản</label>
                <MultiCombobox
                    placeholder="Chọn loại"
                    options={propertyTypes.map(p => ({ value: p.value, label: p.label }))}
                    value={filters.property_type_slug}
                    onChange={(v) => update("property_type_slug", v)}
                />
            </div>

            <div>
                <label className="text-sm font-medium block">Quận huyện</label>
                <MultiCombobox
                    placeholder="Chọn quận"
                    options={districts.map(d => ({ value: d.codename, label: d.name }))}
                    value={filters.district_slugs}
                    onChange={(v) => update("district_slugs", v)}
                />
            </div>

            <div>
                <label className="text-sm font-medium block">Phường xã</label>
                <MultiCombobox
                    disabled={filters.district_slugs.length === 0}
                    placeholder="Chọn phường"
                    options={wards.map(w => ({
                        value: w.codename,
                        label: `${w.name} - ${districts.find(d => d.code === w.district.code)?.name || ""}`,
                    }))}
                    value={filters.ward_slugs}
                    onChange={(v) => update("ward_slugs", v)}
                />
            </div>

            {/* Giá + diện tích giữ nguyên */}
            <div>
                <label className="text-sm font-medium block">Khoảng giá</label>
                <MultiCombobox
                    placeholder="Chọn giá"
                    options={priceRanges.map(p => ({ value: p.label, label: p.label }))}
                    value={filters.price_range_labels}
                    onChange={(v) => update("price_range_labels", v)}
                />
            </div>

            <div>
                <label className="text-sm font-medium block">Diện tích</label>
                <MultiCombobox
                    placeholder="Chọn diện tích"
                    options={areaRanges.map(a => ({ value: a.label, label: a.label }))}
                    value={filters.area_range_labels}
                    onChange={(v) => update("area_range_labels", v)}
                />
            </div>

            <div className="flex gap-2">
                <Button onClick={handleApply} disabled={isPending} className="flex-1">
                    Tìm kiếm
                </Button>
                <Button variant="outline" onClick={handleReset}>Xóa</Button>
            </div>
        </Card>
    );
}