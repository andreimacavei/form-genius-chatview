import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import React from "react";

interface SingleSelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string | null;
}

export const SingleSelectInput: React.FC<SingleSelectInputProps> = ({
  value,
  onChange,
  options,
  error,
}) => (
  <>
    <RadioGroup value={value} onValueChange={onChange} className="space-y-2 ">
      {options.map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <RadioGroupItem value={option} id={option} />
          <Label htmlFor={option}>{option}</Label>
        </div>
      ))}
    </RadioGroup>
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </>
);
