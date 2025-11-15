"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utilities/cn";

export interface MultiComboboxOption {
  value: string;
  label: string;
}

const MOBILE_BREAKPOINT = 768;

interface MultiComboboxProps {
  options: MultiComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  maxSelected?: number;
  value?: any;
  onChange?: (value: any) => void;
  onSearch?: (term: string) => void;
}

export function MultiCombobox({
  options,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  emptyText = "Không tìm thấy.",
  className,
  disabled = false,
  maxSelected,
  value,
  onChange,
  onSearch,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const selectedValues = value ?? [];
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );

  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
  
    React.useEffect(() => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      };
      mql.addEventListener("change", onChange);
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      return () => mql.removeEventListener("change", onChange);
    }, []);

  const filteredOptions = React.useMemo(() => {
    if (onSearch) return options;
    if (!searchTerm.trim()) return options;
    const lower = searchTerm.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, searchTerm, onSearch]);

  const handleSelect = (optionValue: string) => {
    let newValue: string[];
    if (selectedValues.includes(optionValue)) {
      newValue = selectedValues.filter((v:any) => v !== optionValue);
    } else {
      if (maxSelected && selectedValues.length >= maxSelected) return;
      newValue = [...selectedValues, optionValue];
    }
    onChange?.(newValue);
  };

  const handleRemove = (optionValue: string) => {
    const newValue = selectedValues.filter((v:any) => v !== optionValue);
    onChange?.(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-10 h-fit hover:bg-accent/20 hover:text-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="mr-1 hover:bg-accent/90 mb-1 bg-accent text-white"
                >
                  <span className="max-w-40 line-clamp-1">{option.label}</span>
                  <button
                    className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => handleRemove(option.value)}
                  >
                    <X className="h-3 w-3 text-white hover:text-foreground" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover z-50"
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchTerm}
            onValueChange={(v) => {
              setSearchTerm(v);
              onSearch?.(v);
            }}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer active:bg-accent/40 select-none"
                    onSelect={!isMobile ? () => handleSelect(option.value) : ()=>{}}
                    onClick={() => handleSelect(option.value)}
                    onTouchStart={() => handleSelect(option.value)} // ✅ mobile fix
                    data-value={option.value}
                    style={{ pointerEvents: "auto" }} // ✅ ensure tap registered
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
