import React from 'react';

interface SensorInputProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
}

const SensorRowInput: React.FC<SensorInputProps> = ({ title, value, onChange }) => {
  return (
    <div className="flex items-center p-4 rounded-md w-full bg-background mx-2 border border-green-500">
      <h3 className="font-medium mr-4">{title}</h3>
      <input
        type="text" // Změna typu na text, aby bylo možné zadat prázdný řetězec
        value={value}
        onChange={(e) => onChange(e.target.value)} // Nezáleží na tom, zda je to číslo nebo prázdný řetězec
        className="p-2 border border-green-500 bg-transparent rounded w-32 text-center ml-auto"
      />
    </div>
  );
};

export default SensorRowInput;
