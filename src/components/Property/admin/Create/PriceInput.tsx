import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface PriceInputProps {
  defaultValue?: number;
  onChange?: (value: number) => void; // Truyền ra ngoài cho react-hook-form
}

const formatPrice = (price: number) => {
  const formatter = new Intl.NumberFormat("vi-VN");
  if (price >= 1_000_000_000) {
    const billions = price / 1_000_000_000;
    return `${billions % 1 === 0 ? formatter.format(billions) : billions.toFixed(1).replace(/\.0$/, "")} tỷ`;
  } else {
    const millions = price / 1_000_000;
    return `${millions % 1 === 0 ? formatter.format(millions) : millions.toFixed(1).replace(/\.0$/, "")} triệu`;
  }
};

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

    // Gợi ý thông minh
    if (raw === "") {
      setSuggestions([]);
    } else {
      const base = Number(raw);
      const options = [
        base * 1_000_000,        // 90 → 90 triệu
        base * 10_000_000,       // 900 triệu
        base * 100_000_000,      // 9 tỷ
        base * 1_000_000_000,    // 90 tỷ
      ].filter((v) => v >= 1_000_000); // Chỉ gợi ý từ 1 triệu trở lên

      setSuggestions(options.slice(0, 4)); // Tối đa 4 gợi ý
    }

    // Gọi onChange để truyền ra ngoài (cho react-hook-form)
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
        className="font-mono"
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