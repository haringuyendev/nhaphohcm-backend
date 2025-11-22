import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface PriceInputProps {
  defaultValue?: number;
  onChange?: (value: number) => void; // Truyền ra ngoài cho react-hook-form
}


const PriceInput = ({ defaultValue, onChange }: PriceInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<number[]>([]);

  // Khởi tạo giá trị từ defaultValue
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue > 0) {
      setInputValue(String(defaultValue));
    }
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ""); // Chỉ giữ số
    const num = raw === "" ? 0 : Number(raw);

    setInputValue(raw);

    // CHỈ gợi ý khi:
    // - Chuỗi nhập vào có từ 1 đến 4 ký tự (hoặc 3 nếu bạn muốn chặt hơn)
    // - Và chưa có quá nhiều số (tránh gợi ý khi đã nhập đầy đủ)
    const shouldShowSuggestions = raw.length >= 1 && raw.length <= 4;

    if (!shouldShowSuggestions || raw === "") {
      setSuggestions([]);
    } else {
      const base = Number(raw);

      // Các hệ số phổ biến tại Việt Nam: triệu → chục triệu → trăm triệu → tỷ
      const multipliers = [1_000_000, 10_000_000, 100_000_000, 1_000_000_000];
      const options = multipliers
        .map(m => base * m)
        .filter(v => v >= 1_000_000); // ít nhất 1 triệu

      setSuggestions(options.slice(0, 4));
    }

    // Truyền giá trị thực (số nguyên) ra ngoài cho form
    onChange?.(num);
  };

  const handleSelect = (value: number) => {
    setInputValue(String(value));
    setSuggestions([]);
    onChange?.(value);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Nhập số (ví dụ: 90 → 90 triệu, 9 tỷ...)"
        value={inputValue}
        onChange={handleInputChange}
      />

      {/* Hiển thị giá trị đã format bên dưới input */}
      {inputValue && Number(inputValue) > 0 && (
        <p className="text-sm text-muted-foreground mt-1">
          ≈ {formatPrice(Number(inputValue))}
        </p>
      )}

      {/* Gợi ý */}
      {suggestions.length > 0 && (
        <Card className="absolute z-10 mt-1 w-full shadow-lg border bg-popover max-h-48 overflow-auto">
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => handleSelect(s)}
              className="px-4 py-2.5 hover:bg-accent cursor-pointer text-sm font-medium flex justify-between"
            >
              <span>{formatPrice(s)}</span>
              <span className="text-xs text-muted-foreground">
                {s.toLocaleString("vi-VN")}₫
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default PriceInput;