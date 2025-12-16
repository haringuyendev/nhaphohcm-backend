// app/[...slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import React, { Suspense } from 'react';

import { RenderBlocks } from '@/blocks/RenderBlocks';
import { RenderHero } from '@/heros/RenderHero';
import { generateMeta } from '@/utilities/generateMeta';
import type { Page } from '@/payload-types';
import Loading from '@/components/LoadingSpinner/Loading';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  });

  return pages.docs
    .filter((doc) => doc.slug !== 'home')
    .map(({ slug }) => ({
      slug: slug.split('/'),
    }));
}

// QUAN TRỌNG: generateMetadata – ĐÚNG NHƯ BẠN MUỐN
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const segments = slug || [];
  const urlSlug = segments.length > 0 ? segments.join('/') : 'home';

  // 1. Nếu là trang CMS → lấy metadata từ CMS
  const cmsPage = await queryPageBySlug({ slug: urlSlug });
  if (cmsPage) {
    return generateMeta({ doc: cmsPage });
  }

  // 2. Nếu không phải CMS → có filter → lấy metadata từ filter
  const filters = await parseSegments(segments);
  const title = filters.title + ' tại Thành phố Hồ Chí Minh' || 'Mua bán bất động sản uy tín tại TP.HCM';

  return {
    title,
    description: `Mua bán nhà đất ${title.toLowerCase().replace('mua bán ', '')} uy tín nhất 2025 tại TP.HCM`,
    openGraph: {
      title,
      description: `Cập nhật danh sách ${title.toLowerCase()} mới nhất, giá rẻ, vị trí đẹp`,
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const segments = slug || [];
  let urlSlug = segments.length > 0 ? segments.join('/') : 'home';
  const resolvedSearchParams = await searchParams;

  const filters = await parseSegments(segments);
  if (filters.property_type_slug || filters.district_slugs?.length || filters.ward_slugs?.length || filters.price_min || filters.area_min) {
    urlSlug = 'home';
  }
  // 1. Ưu tiên trang CMS (home, gioi-thieu, tin-tuc/...)
  const cmsPage = await queryPageBySlug({ slug: urlSlug });
  if (cmsPage) {
    const { hero, layout } = cmsPage;
    return (
      <article>
        <Suspense key={urlSlug} fallback={<Loading />}>
          <RenderHero {...hero} />
          <RenderBlocks blocks={layout} searchParams={resolvedSearchParams} />
        </Suspense>
      </article>
    );
  }

  // 2. Nếu không phải CMS → trang tìm kiếm BĐS

  // 3. Không tìm thấy gì → 404
  notFound();
}
async function parseSegments(segments: string[]) {
  const payload = await getPayload({ config: configPromise });

  const filters: any = {
    title: "",
    property_type_slug: [],
    district_slugs: [],
    ward_slugs: [],
    price_min: null,
    price_max: null,
    area_min: null,
    area_max: null,
  };

  const titleParts: string[] = [];

  for (const seg of segments) {
    const s = seg.toLowerCase();
    //
    // 1) MULTI PROPERTY TYPE + MULTI LOCATION
    //
    if (s.startsWith("mua-ban-")) {
      // eslint-disable-next-line prefer-const
      let cleaned = s.replace("mua-ban-", "");

      const parts = cleaned.split("-tai-");
      // === PROPERTY TYPES (multi bằng dấu +) ===
      const propertyTypeSlug = parts[0].split("%2b");
      if (!propertyTypeSlug.includes("bat-dong-san")) {
        filters.property_type_slug = propertyTypeSlug;

        // Lấy label từng loại BĐS
        const labels: string[] = [];

        for (const typeSlug of propertyTypeSlug) {
          const pt = await payload.find({
            collection: "property_type",
            where: { value: { equals: typeSlug } },
            limit: 1
          });

          if (pt?.docs?.[0]) {
            labels.push(pt.docs[0].label);
          }
        }

        // Gộp thành một câu
        if (labels.length > 0) {
          titleParts.push("Mua bán " + labels.join(", "));
        }
      }
      else {
        titleParts.push("Mua bán bất động sản");
      }


      // Không có location
      if (parts.length < 2) continue;

      //
      // === MULTI WARD + MULTI DISTRICT ===
      //
      const location = parts[1];

      // VD: phuong-13+phuong-15-quan-10+quan-binh-thanh
      const groups = location.split("-");

      for (const g of groups) {
        const items = g.split("+"); // Multi token

        for (const item of items) {
          const [prefix, value] = item.split("-");

          if (prefix === "phuong" && value) {
            const code = "phuong_" + value;
            filters.ward_slugs.push(code);

            const ward = await payload.find({
              collection: "wards",
              where: { codename: { equals: code } },
              limit: 1,
            });

            if (ward?.docs?.[0]) titleParts.push(ward.docs[0].name);
          }

          if (prefix === "quan" && value) {
            const code = "quan_" + value;
            filters.district_slugs.push(code);

            const district = await payload.find({
              collection: "districts",
              where: { codename: { equals: code } },
              limit: 1,
            });

            if (district?.docs?.[0]) titleParts.push(district.docs[0].name);
          }
        }
      }

      continue;
    }

    //
    // 2) Giá
    //
    const priceMatch = s.match(/gia-tu-(\d+)-(\d+)-ty|gia-tren-(\d+)-ty/);
    if (priceMatch) {
      const [_, from, to, above] = priceMatch;

      if (above) {
        filters.price_min = Number(above) * 1e9;
        titleParts.push(`trên ${above} tỷ`);
      } else {
        filters.price_min = Number(from) * 1e9;
        filters.price_max = Number(to) * 1e9;
        titleParts.push(`giá từ ${from} đến ${to} tỷ`);
      }
      continue;
    }

    //
    // 3) Diện tích
    //
    const areaMatch = s.match(/dien-tich-tu-(\d+)-(\d+)-m2|dien-tich-tren-(\d+)-m2/);
    if (areaMatch) {
      const [_, from, to, above] = areaMatch;

      if (above) {
        filters.area_min = Number(above);
        titleParts.push(`trên ${above}m²`);
      } else {
        filters.area_min = Number(from);
        filters.area_max = Number(to);
        titleParts.push(`diện tích từ ${from} đến ${to}m²`);
      }
      continue;
    }
  }

  //
  // BUILD TITLE FINAL
  //
  filters.title = titleParts.join(" ");

  return filters;
}

const queryPageBySlug = async ({ slug }: { slug: string }): Promise<Page | null> => {
  const { isEnabled: draft } = await draftMode();
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  });

  return result.docs[0] || null;
};