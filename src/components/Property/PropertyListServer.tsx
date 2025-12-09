// PropertyList.server.tsx
import PropertyCard from "@/components/Property/PropertyCard";
import { getProperties } from "@/endpoints/common/properties";
import { Property } from "@/payload-types";
import { MapPin } from "lucide-react";
import { Suspense } from "react";
import PropertyListSkeleton from "../Skeleton/PropertyListSkeleton";
import { PropertyPagination } from "./Pagination";

interface PropertyListServerProps {
    filters: { [key: string]: string | string[] | undefined };
    limit: number;
    currentPage: number;
}
async function PropertyListContent({ filters, limit, currentPage }: PropertyListServerProps) {

    console.log(filters);
    const propertiesData = await getProperties({
        ...filters,
        limit: limit.toString(),
        page: currentPage.toString()
    });

    const properties = propertiesData.docs as Property[];
    if (properties.length === 0) {
        return (
            <>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                        Mua bán nhà đất tại TP. Hồ Chí Minh
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
                        <p className="text-muted-foreground">
                            Hiện có{" "}
                            <span className="font-semibold text-primary">
                                {properties.length}
                            </span>{" "}
                            bất động sản đang hiển thị.
                        </p>
                    </div>
                </div>
                <div className="text-center py-12 bg-card border rounded-lg">
                    <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg">
                        Không tìm thấy bất động sản phù hợp
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                    </p>
                </div>
            </>
        );
    }

    return (
        <div className="space-y-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                    Mua bán nhà đất tại TP. Hồ Chí Minh
                </h2>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
                    <p className="text-muted-foreground">
                        Hiện có{" "}
                        <span className="font-semibold text-primary">
                            {properties.length} trong {propertiesData.totalDocs}
                        </span>{" "}
                        bất động sản đang hiển thị.
                    </p>
                </div>
            </div>
            {properties.map((property: Property) => (
                <PropertyCard key={property.id} property={property} />
            ))}
            <PropertyPagination
                currentPage={currentPage}
                totalPages={propertiesData.totalPages}
            />
        </div>
    );
}
export default function PropertyListServer(props: PropertyListServerProps) {
    // The fallback will show while the 'async' component above is running
    return (
        <>
            <Suspense key={JSON.stringify(props)} fallback={<PropertyListSkeleton />}>
                <PropertyListContent {...props} />
            </Suspense>
        </>
    );
}