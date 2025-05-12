import { Input } from "../ui/input";
import React from "react";

interface EmailInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  placeholder?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  error,
  placeholder,
}) => (
  <>
    <Input
      type="email"
      value={value}
      onChange={onChange}
      placeholder={placeholder || "your@email.com"}
    />
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </>
);
