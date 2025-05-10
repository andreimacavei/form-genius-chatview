import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import React from "react";

interface DropdownInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string | null;
}

export const DropdownInput: React.FC<DropdownInputProps> = ({ value, onChange, options, error }) => (
  <>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full mt-4">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </>
); 