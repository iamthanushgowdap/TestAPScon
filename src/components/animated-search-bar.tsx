
'use client';
import type { ChangeEventHandler } from 'react';

interface AnimatedSearchBarProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
}

export default function AnimatedSearchBar({ value, onChange, placeholder = 'Search...' }: AnimatedSearchBarProps) {
  const onReset = () => {
    // Create a synthetic event to clear the input
    const event = {
      target: { value: '' },
      currentTarget: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <form className="search-box">
      <input
        type="text"
        placeholder={value ? "" : placeholder}
        value={value}
        onChange={onChange}
      />
      <button type="reset" onClick={onReset}></button>
    </form>
  );
}
