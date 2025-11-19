// 🏢 Loại bất động sản
  export const propertyTypes = [
    { label: "Tất cả", value: "all" },
    { label: "Căn hộ dịch vụ", value: "apartment" },
    { label: "Nhà riêng", value: "house" },
    { label: "Nhà mặt phố", value: "shophouse" },
    { label: "Đất - Nhà nát", value: "land" },
    { label: "Biệt thự", value: "villa" },
    { label: "Tòa nhà văn phòng", value: "office" },
  ];

  // 💰 Khoảng giá (VNĐ)
  export const priceRanges = [
    { min: null, max: null, label: "Tất cả" },
    { min: 6_000_000_000, max: 10_000_000_000, label: "6 - 10 tỷ" },
    { min: 10_000_000_000, max: 20_000_000_000, label: "10 - 20 tỷ" },
    { min: 20_000_000_000, max: 40_000_000_000, label: "20 - 40 tỷ" },
    { min: 40_000_000_000, max: null, label: "Trên 40 tỷ" },
  ];

  // 📏 Khoảng diện tích (m²)
  export const areaRanges = [
    { min: null, max: null, label: "Tất cả" },
    { min: 0, max: 50, label: "Dưới 50 m²" },
    { min: 50, max: 100, label: "50 - 100 m²" },
    { min: 100, max: 200, label: "100 - 200 m²" },
    { min: 200, max: null, label: "Trên 200 m²" },
  ];
