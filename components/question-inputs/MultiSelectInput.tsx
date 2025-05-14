import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import React, { useRef, useEffect, useState } from "react";

interface MultiSelectInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  error?: string | null;
}

export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
  value,
  onChange,
  options,
  error,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridCols, setGridCols] = useState("md:grid-cols-3");

  useEffect(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    if (!containerWidth) return;
    // Create a temporary span to measure text width
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.position = "absolute";
    tempSpan.style.whiteSpace = "nowrap";
    document.body.appendChild(tempSpan);
    let maxOptionWidth = 0;
    options.forEach(option => {
      tempSpan.textContent = option;
      maxOptionWidth = Math.max(maxOptionWidth, tempSpan.offsetWidth);
    });
    document.body.removeChild(tempSpan);
    if (maxOptionWidth > containerWidth / 2) {
      setGridCols(""); // 1 column
    } else if (maxOptionWidth > containerWidth / 3) {
      setGridCols("grid-cols-2");
    } else {
      setGridCols("grid-cols-2 md:grid-cols-3");
    }
  }, [options]);

  return (
    <div>
      <div ref={containerRef} className={`grid gap-3 ${gridCols}`}>
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={option}
              checked={value.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...value, option]);
                } else {
                  onChange(value.filter((id) => id !== option));
                }
              }}
            />
            <Label htmlFor={option}>{option}</Label>
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
