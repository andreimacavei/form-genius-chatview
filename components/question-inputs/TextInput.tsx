import { Input } from "../ui/input";
import React from "react";

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  placeholder?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, error, placeholder }) => (
  <>
    <Input
      value={value}
      onChange={onChange}
      className="mt-4"
      placeholder={placeholder || "Type your answer..."}
    />
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </>
); 