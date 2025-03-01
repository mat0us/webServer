import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      {/* Dynamické pozadí přepínače */}
      <div
        className={`w-11 h-6 rounded-full shadow-inner transition-colors duration-200 ${
          checked ? 'bg-input' : 'bg-gray-300'
        }`}
      ></div>
      <div
        className={`absolute w-5 h-5 rounded-full shadow transition-transform duration-200 ease-in-out transform ${
          checked ? 'bg-green-500 translate-x-5' : 'bg-gray-500 translate-x-1'
        }`}
      ></div>
    </label>
  );
};

export default Switch;
