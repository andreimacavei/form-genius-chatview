import { Slider } from "../ui/slider";
import React from "react";

interface NumberRangeInputProps {
  value: number[];
  onChange: (value: number[]) => void;
  min: number;
  max: number;
}

export const NumberRangeInput: React.FC<NumberRangeInputProps> = ({ value, onChange, min, max }) => (
  <div className="space-y-4 mt-4">
    <Slider
      value={value}
      min={min}
      max={max}
      step={1}
      onValueChange={onChange}
    />
    <div className="flex justify-between">
      <span>{min}</span>
      <span className="font-bold">{value[0]}</span>
      <span>{max}</span>
    </div>
  </div>
); 