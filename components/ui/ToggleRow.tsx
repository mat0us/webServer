import React, { useState, useEffect } from "react";
import Switch from "./switchProps";

interface ToggleRowProps {
  title: string;
  subtitle: string;
  isChecked: boolean;
  onToggle: (
    checked: boolean,
    timeMode?: "always" | "time",
    timeFrom?: string,
    timeTo?: string
  ) => void;
  initialTimeMode?: "always" | "time";
  initialTimeFrom?: string;
  initialTimeTo?: string;
  showDelay?: boolean;
  initialDelay?: string;
  onDelayChange?: (delay: string) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  title,
  subtitle,
  isChecked,
  onToggle,
  initialTimeMode = "always",
  initialTimeFrom = "",
  initialTimeTo = "",
  showDelay = false,
  initialDelay = "",
  onDelayChange,
}) => {
  const [timeMode, setTimeMode] = useState<"always" | "time">(initialTimeMode);
  const [timeFrom, setTimeFrom] = useState(initialTimeFrom);
  const [timeTo, setTimeTo] = useState(initialTimeTo);
  const [delay, setDelay] = useState(initialDelay);
  const [showTimeInputs, setShowTimeInputs] = useState(timeMode === "time");

  useEffect(() => {
    setTimeMode(initialTimeMode);
    setTimeFrom(initialTimeFrom);
    setTimeTo(initialTimeTo);
    setDelay(initialDelay);
    setShowTimeInputs(initialTimeMode === "time");
  }, [initialTimeMode, initialTimeFrom, initialTimeTo, initialDelay]);

  const handleToggle = (checked: boolean) => {
    if (showDelay) {
      onToggle(checked);
    } else {
      onToggle(checked, timeMode, timeFrom, timeTo);
    }
  };

  const handleTimeModeChange = (newMode: "always" | "time") => {
    setTimeMode(newMode);
    setShowTimeInputs(newMode === "time");
    onToggle(isChecked, newMode, timeFrom, timeTo);
  };

  return (
    <div className="p-2 sm:p-4 rounded-md w-full bg-background mx-0 sm:mx-2 border border-green-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0">
        <h3 className="font-medium">{title}</h3>
        <Switch checked={isChecked} onChange={() => handleToggle(!isChecked)} />
      </div>

      {isChecked && !showDelay && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            {subtitle}
          </label>
          <select
            value={timeMode}
            onChange={(e) => {
              handleTimeModeChange(e.target.value as "always" | "time");
            }}
            className="p-2 border border-green-500 bg-transparent rounded w-full mb-2"
          >
            <option value="always">Celý den</option>
            <option value="time">Nastavit čas</option>
          </select>

          {showTimeInputs && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Od:
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={timeFrom}
                    onChange={(e) => {
                      setTimeFrom(e.target.value);
                      onToggle(isChecked, timeMode, e.target.value, timeTo);
                    }}
                    className="p-2 border border-green-500 bg-transparent rounded w-full cursor-pointer hover:border-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Do:
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={timeTo}
                    onChange={(e) => {
                      setTimeTo(e.target.value);
                      onToggle(isChecked, timeMode, timeFrom, e.target.value);
                    }}
                    className="p-2 border border-green-500 bg-transparent rounded w-full cursor-pointer hover:border-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isChecked && showDelay && onDelayChange && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Zpoždění (ms)
          </label>
          <input
            type="number"
            value={delay}
            onChange={(e) => {
              setDelay(e.target.value);
              onDelayChange(e.target.value);
            }}
            className="p-2 border border-green-500 bg-transparent rounded w-32"
            min="0"
          />
        </div>
      )}
    </div>
  );
};

export default ToggleRow;
