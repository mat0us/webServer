import React, { useState, useEffect } from "react";
import Switch from "./switchProps";

interface TimeRange {
  startTime: string;
  endTime: string;
  isPeriodic?: boolean;
  periodicity?: number; // in minutes
}

interface ToggleRowProps {
  title: string;
  subtitle?: string;
  isChecked: boolean;
  onToggle: (checked: boolean, timeRanges?: TimeRange[]) => void;
  timeRanges?: TimeRange[];
  mode: "timeRange" | "peristaltic";
  runTime?: number; // in seconds for peristaltic pump
  onRunTimeChange?: (seconds: number) => void;
  onTimeRangeAdd?: (range: TimeRange[]) => void;
  onTimeRangeDelete?: (index: number) => void;
  onConfirm?: () => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  title,
  subtitle,
  isChecked,
  onToggle,
  timeRanges = [],
  mode,
  runTime = 10,
  onRunTimeChange,
  onTimeRangeAdd,
  onTimeRangeDelete,
  onConfirm,
}) => {
  const [currentRange, setCurrentRange] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [tempRunTime, setTempRunTime] = useState(runTime.toString());
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingTimeRange, setPendingTimeRange] = useState<TimeRange | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && mode === "peristaltic") {
      timer = setTimeout(() => {
        setIsRunning(false);
        onToggle(false);
      }, runTime * 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRunning, runTime, mode, onToggle]);

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const validateTimeRanges = (ranges: TimeRange[], newRange?: TimeRange): boolean => {
    // If this is a periodic range, we'll validate it differently
    if (newRange?.isPeriodic) {
      // For periodic ranges, just check that start time is before end time
      if (timeToMinutes(newRange.startTime) >= timeToMinutes(newRange.endTime)) {
        setError("Počáteční čas musí být před koncovým časem");
        return false;
      }
      
      // Check that periodicity is valid
      if (!newRange.periodicity || newRange.periodicity <= 0) {
        setError("Délka intervalu musí být větší než 0");
        return false;
      }
      
      setError(null);
      return true;
    }
    
    const allRanges = newRange ? [...ranges, newRange] : ranges;

    // Sort ranges by start time
    const sortedRanges = [...allRanges].sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    // Check for overlaps
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const currentEnd = timeToMinutes(sortedRanges[i].endTime);
      const nextStart = timeToMinutes(sortedRanges[i + 1].startTime);
      
      if (currentEnd >= nextStart) {
        setError("Intervaly se nesmí překrývat");
        return false;
      }
    }

    // Check that start time is before end time for each range
    for (const range of sortedRanges) {
      if (timeToMinutes(range.startTime) >= timeToMinutes(range.endTime)) {
        setError("Počáteční čas musí být před koncovým časem");
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleTimeRangeAdd = () => {
    setPendingTimeRange({ 
      startTime: "00:00", 
      endTime: "00:00", 
      isPeriodic: false, 
      periodicity: 60 // Default to 1 hour
    });
    setCurrentRange(timeRanges.length);
  };

  const handleTimeRangeDelete = (index: number) => {
    if (onTimeRangeDelete) {
      onTimeRangeDelete(index);
      setHasChanges(true);
      setPendingTimeRange(null);
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (pendingTimeRange) {
      const newRange = {
        ...pendingTimeRange,
        [type === 'start' ? 'startTime' : 'endTime']: value,
      };
      setPendingTimeRange(newRange);
      validateTimeRanges(timeRanges, newRange);
    } else {
      const newRanges = [...timeRanges];
      newRanges[currentRange] = {
        ...newRanges[currentRange],
        [type === 'start' ? 'startTime' : 'endTime']: value,
      };
      if (validateTimeRanges(newRanges)) {
        onToggle(isChecked, newRanges);
        setHasChanges(true);
      }
    }
  };

  const handlePeriodicityChange = (value: string) => {
    if (pendingTimeRange) {
      const newRange = {
        ...pendingTimeRange,
        periodicity: parseInt(value),
      };
      setPendingTimeRange(newRange);
    } else {
      const newRanges = [...timeRanges];
      newRanges[currentRange] = {
        ...newRanges[currentRange],
        periodicity: parseInt(value),
      };
      onToggle(isChecked, newRanges);
      setHasChanges(true);
    }
  };

  const handleIsPeriodicChange = () => {
    if (pendingTimeRange) {
      const newRange = {
        ...pendingTimeRange,
        isPeriodic: !pendingTimeRange.isPeriodic,
      };
      setPendingTimeRange(newRange);
    } else {
      const newRanges = [...timeRanges];
      newRanges[currentRange] = {
        ...newRanges[currentRange],
        isPeriodic: !newRanges[currentRange].isPeriodic,
      };
      onToggle(isChecked, newRanges);
      setHasChanges(true);
    }
  };

  const handleConfirmNewRange = () => {
    if (pendingTimeRange && onTimeRangeAdd && validateTimeRanges(timeRanges, pendingTimeRange)) {
      if (pendingTimeRange.isPeriodic && pendingTimeRange.periodicity) {
        // Create periodic intervals
        const startMinutes = timeToMinutes(pendingTimeRange.startTime);
        const endMinutes = timeToMinutes(pendingTimeRange.endTime);
        
        // Create intervals based on periodicity
        const intervals = [];
        let currentStart = startMinutes;
        
        // For each interval, we'll create an active period followed by an inactive period
        // The total duration of one cycle is 2 * periodicity
        while (currentStart < endMinutes) {
          // Calculate the end of this active period
          const currentEnd = Math.min(currentStart + pendingTimeRange.periodicity, endMinutes);
          
          // Only add the interval if it fits completely within the range
          if (currentEnd <= endMinutes) {
            intervals.push({
              startTime: minutesToTime(currentStart),
              endTime: minutesToTime(currentEnd),
              isPeriodic: false // Individual intervals are not periodic
            });
          }
          
          // Move to the start of the next active period (skip one periodicity for the gap)
          currentStart += pendingTimeRange.periodicity * 2;
        }
        
        // Add all intervals at once
        onTimeRangeAdd(intervals);
      } else {
        // Add single interval
        onTimeRangeAdd([pendingTimeRange]);
      }
      
      setPendingTimeRange(null);
      setHasChanges(true);
    }
  };

  const handleCancelNewRange = () => {
    setPendingTimeRange(null);
    setError(null);
    if (timeRanges.length > 0) {
      setCurrentRange(timeRanges.length - 1);
    }
  };

  const handlePeristalticStart = () => {
    setIsRunning(true);
    onToggle(true);
  };

  const handleRunTimeChange = () => {
    const newTime = parseInt(tempRunTime);
    if (!isNaN(newTime) && newTime > 0 && onRunTimeChange) {
      onRunTimeChange(newTime);
      setEditingTime(false);
    }
  };

  const minutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  if (mode === "peristaltic") {
    return (
      <div className="p-4 rounded-md w-full bg-background border border-green-500">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="font-medium">{title}</h3>
              {editingTime ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={tempRunTime}
                    onChange={(e) => setTempRunTime(e.target.value)}
                    className="w-16 p-1 border border-green-500 rounded bg-transparent text-sm"
                  />
                  <span className="text-sm text-gray-500">s</span>
                  <button
                    onClick={handleRunTimeChange}
                    className="text-green-500 text-sm hover:text-green-600"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {runTime}s
                  </span>
                  <button
                    onClick={() => {
                      setTempRunTime(runTime.toString());
                      setEditingTime(true);
                    }}
                    className="text-green-500 hover:text-green-600"
                  >
                    ✎
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handlePeristalticStart}
            disabled={isRunning}
            className={`w-full py-3 px-4 rounded-md ${
              isRunning
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white transition-colors font-medium`}
          >
            {isRunning ? "Probíhá..." : `Spustit`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-md w-full bg-background border border-green-500">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <Switch checked={isChecked} onChange={() => onToggle(!isChecked)} />
        </div>
        
        {isChecked && (
          <div className="mt-2">
            {(timeRanges.length > 0 || pendingTimeRange) ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setCurrentRange((prev) => Math.max(0, prev - 1))}
                    className="p-2 text-green-500 disabled:text-gray-400"
                    disabled={currentRange === 0 || !!pendingTimeRange}
                  >
                    ←
                  </button>
                  <span className="text-sm">
                    {pendingTimeRange ? 'Nový interval' : `Interval ${currentRange + 1} z ${timeRanges.length}`}
                  </span>
                  <button
                    onClick={() => setCurrentRange((prev) => Math.min(timeRanges.length - 1, prev + 1))}
                    className="p-2 text-green-500 disabled:text-gray-400"
                    disabled={currentRange === timeRanges.length - 1 || !!pendingTimeRange}
                  >
                    →
                  </button>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm mb-1">Od:</label>
                    <input
                      type="time"
                      value={pendingTimeRange?.startTime || timeRanges[currentRange]?.startTime || ""}
                      className="w-full p-2 border border-green-500 rounded bg-transparent"
                      onChange={(e) => handleTimeChange('start', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm mb-1">Do:</label>
                    <input
                      type="time"
                      value={pendingTimeRange?.endTime || timeRanges[currentRange]?.endTime || ""}
                      className="w-full p-2 border border-green-500 rounded bg-transparent"
                      onChange={(e) => handleTimeChange('end', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id={`periodic-${title}`}
                    checked={pendingTimeRange?.isPeriodic || timeRanges[currentRange]?.isPeriodic || false}
                    onChange={handleIsPeriodicChange}
                    className="mr-2 h-4 w-4 border-green-500 rounded"
                  />
                  <label htmlFor={`periodic-${title}`} className="text-sm">
                    Vytvořit periodické intervaly s pauzami
                  </label>
                </div>
                
                {(pendingTimeRange?.isPeriodic || timeRanges[currentRange]?.isPeriodic) && (
                  <div className="mb-4">
                    <label className="block text-sm mb-1">Délka intervalu (minuty):</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={pendingTimeRange?.periodicity || timeRanges[currentRange]?.periodicity || 60}
                        className="w-24 p-2 border border-green-500 rounded bg-transparent"
                        onChange={(e) => handlePeriodicityChange(e.target.value)}
                      />
                      <span className="text-sm text-gray-500">minut</span>
                      
                      <select 
                        className="ml-4 p-2 border border-green-500 rounded bg-transparent"
                        value={pendingTimeRange?.periodicity || timeRanges[currentRange]?.periodicity || 60}
                        onChange={(e) => handlePeriodicityChange(e.target.value)}
                      >
                        <option value="30">30 minut</option>
                        <option value="60">1 hodina</option>
                        <option value="120">2 hodiny</option>
                        <option value="180">3 hodiny</option>
                        <option value="240">4 hodiny</option>
                      </select>
                    </div>
                    
                    {(() => {
                      const startTime = pendingTimeRange?.startTime || timeRanges[currentRange]?.startTime || "00:00";
                      const endTime = pendingTimeRange?.endTime || timeRanges[currentRange]?.endTime || "00:00";
                      const periodicity = pendingTimeRange?.periodicity || timeRanges[currentRange]?.periodicity || 60;
                      
                      const startMinutes = timeToMinutes(startTime);
                      const endMinutes = timeToMinutes(endTime);
                      const totalMinutes = endMinutes - startMinutes;
                      
                      if (totalMinutes <= 0) return null;
                      
                      // Calculate how many complete intervals will fit
                      // Each cycle is 2 * periodicity (active + inactive)
                      const intervalCount = Math.floor(totalMinutes / (periodicity * 2));
                      // Add one more if there's room for at least one more active period
                      const extraInterval = (totalMinutes % (periodicity * 2) >= periodicity) ? 1 : 0;
                      const totalIntervals = intervalCount + extraInterval;
                      
                      return (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Vytvoří se přibližně {totalIntervals} intervalů od {startTime} do {endTime} s délkou {periodicity} minut, mezi kterými budou pauzy stejné délky.
                          </p>
                          <div className="mt-2 text-xs text-gray-500">
                            <strong>Náhled intervalů:</strong>
                            <ul className="mt-1 pl-4 list-disc">
                              {Array.from({ length: Math.min(totalIntervals, 5) }).map((_, i) => {
                                // Each interval starts at startMinutes + (i * periodicity * 2)
                                const intervalStart = startMinutes + (i * periodicity * 2);
                                const intervalEnd = Math.min(intervalStart + periodicity, endMinutes);
                                
                                // Only show intervals that fit within the range
                                if (intervalStart < endMinutes) {
                                  return (
                                    <li key={i}>
                                      {minutesToTime(intervalStart)} - {minutesToTime(intervalEnd)}
                                    </li>
                                  );
                                }
                                return null;
                              })}
                              {totalIntervals > 5 && <li>...</li>}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                {error && (
                  <div className="mt-2 text-red-500 text-sm">
                    {error}
                  </div>
                )}
                <div className="flex justify-between mt-4">
                  {pendingTimeRange ? (
                    <>
                      <button
                        onClick={handleCancelNewRange}
                        className="text-red-500 text-sm hover:text-red-600"
                      >
                        Zrušit
                      </button>
                      <button
                        onClick={handleConfirmNewRange}
                        className="text-green-500 text-sm hover:text-green-600"
                        disabled={!!error}
                      >
                        Potvrdit interval
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleTimeRangeDelete(currentRange)}
                        className="text-red-500 text-sm hover:text-red-600"
                      >
                        Smazat interval
                      </button>
                      <button
                        onClick={handleTimeRangeAdd}
                        className="text-green-500 text-sm hover:text-green-600"
                      >
                        Přidat interval
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={handleTimeRangeAdd}
                  className="text-green-500 text-sm hover:text-green-600"
                >
                  Přidat interval
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToggleRow;
