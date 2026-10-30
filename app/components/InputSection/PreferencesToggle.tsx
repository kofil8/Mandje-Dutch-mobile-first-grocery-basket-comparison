"use client";

import { Leaf } from "lucide-react";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function PreferencesToggle({ checked, onChange }: Props) {
  return (
    <label className="organic-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle-track" aria-hidden="true">
        <span />
      </span>
      <span className="organic-label">
        <strong>Alleen biologische producten</strong>
        <small>Vergelijk waar mogelijk biologisch</small>
      </span>
      <Leaf size={17} className="organic-leaf" aria-hidden="true" />
    </label>
  );
}
