import React, { useState } from 'react';
import Switch from './switchProps';

interface ToggleRowProps {
  title: string;
  subtitle: string; // Přidáno pro popis
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ title, subtitle, isChecked, onToggle }) => {
  const [timeMode, setTimeMode] = useState<'always' | 'time'>('always'); // Přidáno pro režim osvětlení
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');

  return (
    <div className="p-4 rounded-md w-full bg-background mx-2 border border-green-500">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        <Switch
          checked={isChecked}
          onChange={() => onToggle(!isChecked)}
        />
      </div>

      {/* Rozbalovací sekce pro výběr režimu osvětlení */}
      {isChecked && (
        <div className="mt-4 bg-red">
          <label className="block text-sm font-medium text-foreground mb-2">{subtitle}</label>
          <select
            value={timeMode}
            onChange={(e) => setTimeMode(e.target.value as 'always' | 'time')}
            className="p-2 border border-green-500 bg-transparent rounded w-full mb-2"
          >
            <option value="always">Always On</option>
            <option value="time">Set Time</option>
          </select>

          {/* Vstupy pro výběr času pouze pokud je vybrán režim "Set Time" */}
          {timeMode === 'time' && (
            <div className="flex space-x-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">From:</label>
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="p-2 border border-green-500 bg-transparent rounded w-full"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="p-2 border border-green-500 bg-transparent rounded w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToggleRow;
