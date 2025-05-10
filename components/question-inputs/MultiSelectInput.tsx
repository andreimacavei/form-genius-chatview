import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import React from "react";

interface MultiSelectInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  error?: string | null;
}

export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({ value, onChange, options, error }) => (
  <div className="space-y-2 mt-4">
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
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </div>
); 