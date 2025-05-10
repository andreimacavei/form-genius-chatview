import { Textarea } from "../ui/textarea";
import React from "react";

interface LongTextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string | null;
  placeholder?: string;
}

export const LongTextInput: React.FC<LongTextInputProps> = ({ value, onChange, error, placeholder }) => (
  <>
    <Textarea
      value={value}
      onChange={onChange}
      className="mt-4"
      placeholder={placeholder || "Type your answer..."}
      rows={4}
    />
    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
  </>
); 