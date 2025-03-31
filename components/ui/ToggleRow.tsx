import React, { useState, useEffect } from "react";
import Switch from "./switchProps";

interface TimeRange {
  start: string;
  end: string;
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
  onTimeRangeDeleteAll?: () => void;
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
  onTimeRangeDeleteAll,
  onConfirm,
}) => {
  const [currentRange, setCurrentRange] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [tempRunTime, setTempRunTime] = useState(runTime.toString());
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingTimeRange, setPendingTimeRange] = useState<TimeRange | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Local state for UI expansion and local checked state
  const [isExpanded, setIsExpanded] = useState(isChecked);
  const [localIsChecked, setLocalIsChecked] = useState(isChecked);

  useEffect(() => {
    // Update local states when isChecked prop changes
    setIsExpanded(isChecked);
    setLocalIsChecked(isChecked);
  }, [isChecked]);

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
      if (timeToMinutes(newRange.start) >= timeToMinutes(newRange.end)) {
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
      timeToMinutes(a.start) - timeToMinutes(b.start)
    );

    // Check for overlaps
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const currentEnd = timeToMinutes(sortedRanges[i].end);
      const nextStart = timeToMinutes(sortedRanges[i + 1].start);
      
      if (currentEnd >= nextStart) {
        setError("Intervaly se nesmí překrývat");
        return false;
      }
    }

    // Check that start time is before end time for each range
    for (const range of sortedRanges) {
      if (timeToMinutes(range.start) >= timeToMinutes(range.end)) {
        setError("Počáteční čas musí být před koncovým časem");
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleTimeRangeAdd = () => {
    setPendingTimeRange({ 
      start: "00:00", 
      end: "00:00", 
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
      
      // If we're deleting the last interval, adjust the current range
      if (index === timeRanges.length - 1 && index > 0) {
        setCurrentRange(index - 1);
      }
    }
  };

  const handleTimeRangeDeleteAll = () => {
    if (onTimeRangeDeleteAll) {
      onTimeRangeDeleteAll();
      setHasChanges(true);
      setPendingTimeRange(null);
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (pendingTimeRange) {
      const newRange = {
        ...pendingTimeRange,
        [type === 'start' ? 'start' : 'end']: value,
      };
      setPendingTimeRange(newRange);
      validateTimeRanges(timeRanges, newRange);
    } else {
      const newRanges = [...timeRanges];
      newRanges[currentRange] = {
        ...newRanges[currentRange],
        [type === 'start' ? 'start' : 'end']: value,
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
        const startMinutes = timeToMinutes(pendingTimeRange.start);
        const endMinutes = timeToMinutes(pendingTimeRange.end);
        
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
              start: minutesToTime(currentStart),
              end: minutesToTime(currentEnd),
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
      <div className="rounded-lg overflow-hidden shadow-md border-l-4 border-l-green-500 transition-all">
        <div className="p-5 bg-gradient-to-r from-green-50/30 to-transparent backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">{title}</h3>
              {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
            </div>
          </div>
          
          <div className="mt-4">
            <div className="bg-white/80 p-4 rounded-md border border-green-200">
              {editingTime ? (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Doba běhu:</label>
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="number"
                      min="1"
                      value={tempRunTime}
                      onChange={(e) => setTempRunTime(e.target.value)}
                      className="w-20 p-2 border border-green-300 rounded-md bg-white/80 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all"
                    />
                    <span className="text-sm text-gray-500">s</span>
                  </div>
                  <button
                    onClick={handleRunTimeChange}
                    className="p-1.5 text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors ml-auto flex items-center justify-center w-8 h-8"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Doba běhu:</span>
                    <span className="text-sm text-gray-600 font-bold">{runTime}s</span>
                  </div>
                  <button
                    onClick={() => {
                      setTempRunTime(runTime.toString());
                      setEditingTime(true);
                    }}
                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors flex items-center justify-center w-8 h-8"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="orange">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg> 
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <button
                onClick={handlePeristalticStart}
                disabled={isRunning}
                className={`w-full py-3 px-4 rounded-md ${
                  isRunning
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white transition-colors font-medium flex items-center justify-center`}
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Probíhá...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Spustit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-md border-l-4 border-l-green-500 transition-all">
      <div className="p-5 bg-gradient-to-r from-green-50/30 to-transparent backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
          </div>
          <Switch 
            checked={localIsChecked} 
            onChange={() => {
              if (localIsChecked) {
                // When turning OFF, always update the database state to false
                onToggle(false, timeRanges);
                setLocalIsChecked(false);
                setIsExpanded(false);
              } else {
                // When turning ON
                if (timeRanges.length > 0) {
                  // If we have intervals, update the database
                  onToggle(true, timeRanges);
                }
                // Either way, update local UI states
                setLocalIsChecked(true);
                setIsExpanded(true);
              }
            }} 
          />
        </div>
        
        {isExpanded && (
          <div className="mt-4">
            {(timeRanges.length > 0 || pendingTimeRange) ? (
              <>
                <div className="flex items-center justify-between mb-3 bg-green-50/50 p-2 rounded-md">
                  {currentRange > 0 && !pendingTimeRange ? (
                    <button
                      onClick={() => setCurrentRange((prev) => Math.max(0, prev - 1))}
                      className="p-2 text-green-600 hover:bg-green-100/50 rounded-full transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : (
                    <div className="w-9 h-9">{/* Placeholder to maintain layout */}</div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {pendingTimeRange ? 'Nový interval' : `Interval ${currentRange + 1} z ${timeRanges.length}`}
                  </span>
                  {currentRange < timeRanges.length - 1 && !pendingTimeRange ? (
                    <button
                      onClick={() => setCurrentRange((prev) => Math.min(timeRanges.length - 1, prev + 1))}
                      className="p-2 text-green-600 hover:bg-green-100/50 rounded-full transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : (
                    <div className="w-9 h-9">{/* Placeholder to maintain layout */}</div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Od:</label>
                      <input
                        type="time"
                        value={pendingTimeRange?.start || timeRanges[currentRange]?.start || ""}
                        className="w-full p-2 border border-green-300 rounded-md bg-white/80 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all"
                        onChange={(e) => handleTimeChange('start', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Do:</label>
                      <input
                        type="time"
                        value={pendingTimeRange?.end || timeRanges[currentRange]?.end || ""}
                        className="w-full p-2 border border-green-300 rounded-md bg-white/80 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all"
                        onChange={(e) => handleTimeChange('end', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-white/80 p-3 rounded-md border border-green-200">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`periodic-${title}`}
                        checked={pendingTimeRange?.isPeriodic || timeRanges[currentRange]?.isPeriodic || false}
                        onChange={handleIsPeriodicChange}
                        className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor={`periodic-${title}`} className="text-sm font-medium text-gray-700">
                        Vytvořit periodické intervaly s pauzami
                      </label>
                    </div>
                    
                    {(pendingTimeRange?.isPeriodic || timeRanges[currentRange]?.isPeriodic) && (
                      <div className="mt-3 pl-6 border-l-2 border-green-200">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Délka intervalu (minuty):</label>
                        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center gap-2">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={pendingTimeRange?.periodicity || timeRanges[currentRange]?.periodicity || 60}
                              className="flex-grow sm:w-20 p-2 border border-green-300 rounded-md bg-white/80 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all"
                              onChange={(e) => handlePeriodicityChange(e.target.value)}
                            />
                            <span className="text-sm text-gray-500 whitespace-nowrap">minut</span>
                          </div>
                          
                          <select
                            className="w-full sm:w-auto p-2 border border-green-300 rounded-md bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all"
                            value={pendingTimeRange?.periodicity || timeRanges[currentRange]?.periodicity || 60}
                            onChange={(e) => handlePeriodicityChange(e.target.value)}
                          >
                            <option value="30" className="text-green-800">30 minut</option>
                            <option value="60" className="text-green-800">1 hodina</option>
                            <option value="120" className="text-green-800">2 hodiny</option>
                            <option value="180" className="text-green-800">3 hodiny</option>
                            <option value="240" className="text-green-800">4 hodiny</option>
                          </select>
                        </div>
                        
                        {(() => {
                          const start = pendingTimeRange?.start || timeRanges[currentRange]?.start || "00:00";
                          const end = pendingTimeRange?.end || timeRanges[currentRange]?.end || "00:00";
                          const periodicity = pendingTimeRange?.periodicity || timeRanges[currentRange]?.periodicity || 60;
                          
                          const startMinutes = timeToMinutes(start);
                          const endMinutes = timeToMinutes(end);
                          const totalMinutes = endMinutes - startMinutes;
                          
                          if (totalMinutes <= 0) return null;
                          
                          // Calculate how many complete intervals will fit
                          // Each cycle is 2 * periodicity (active + inactive)
                          const intervalCount = Math.floor(totalMinutes / (periodicity * 2));
                          // Add one more if there's room for at least one more active period
                          const extraInterval = (totalMinutes % (periodicity * 2) >= periodicity) ? 1 : 0;
                          const totalIntervals = intervalCount + extraInterval;
                          
                          return (
                            <div className="mt-3 bg-green-50/70 p-3 rounded-md">
                              <p className="text-xs text-gray-600 font-medium">
                                Vytvoří se přibližně {totalIntervals} intervalů od {start} do {end} s délkou {periodicity} minut, mezi kterými budou pauzy stejné délky.
                              </p>
                              <div className="mt-2">
                                <p className="text-xs font-semibold text-gray-700">Náhled intervalů:</p>
                                <ul className="mt-1 pl-4 space-y-1">
                                  {Array.from({ length: Math.min(totalIntervals, 5) }).map((_, i) => {
                                    // Each interval starts at startMinutes + (i * periodicity * 2)
                                    const intervalStart = startMinutes + (i * periodicity * 2);
                                    const intervalEnd = Math.min(intervalStart + periodicity, endMinutes);
                                    
                                    // Only show intervals that fit within the range
                                    if (intervalStart < endMinutes) {
                                      return (
                                        <li key={i} className="text-xs text-gray-600 flex items-center">
                                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                          {minutesToTime(intervalStart)} - {minutesToTime(intervalEnd)}
                                        </li>
                                      );
                                    }
                                    return null;
                                  })}
                                  {totalIntervals > 5 && <li className="text-xs text-gray-500 italic">...</li>}
                                </ul>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  
                  {error && (
                    <div className="mt-2 text-red-500 text-sm font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                      </svg>
                      {error}
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 pt-4 border-t border-green-200">
                    {pendingTimeRange ? (
                      <>
                        <button
                          onClick={handleCancelNewRange}
                          className="px-3 py-1.5 rounded-md border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors w-full sm:w-auto"
                        >
                          Zrušit
                        </button>
                        <button
                          onClick={handleConfirmNewRange}
                          className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                          disabled={!!error}
                        >
                          Vytvořit interval
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleTimeRangeDelete(currentRange)}
                            className="px-3 py-1.5 rounded-md border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors w-full sm:w-auto"
                          >
                            Smazat interval
                          </button>

                          <button
                            onClick={handleTimeRangeDeleteAll}
                            className="px-3 py-1.5 rounded-md border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors w-full sm:w-auto"
                          >
                            Smazat všechny
                          </button>
                        </div>
                        
                        <button
                          onClick={handleTimeRangeAdd}
                          className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center w-full sm:w-auto"
                        >
                          {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg> */}
                          Přidat interval
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        if (onConfirm) {
                          // Update database when confirming settings
                          onConfirm();
            
                          // Set database state to true when submitting time ranges
                          if (timeRanges.length > 0) {
                            onToggle(true, timeRanges);
                          }
                        }
                      }}
                      className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center w-full sm:w-auto"
                    >
                      {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg> */}
                      Potvrdit
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center my-4">
                <button
                  onClick={handleTimeRangeAdd}
                  className="w-full py-3 px-4 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors font-medium flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Přidat interval
                </button>
              </div>
            )
          }
          </div>
        )}
      </div>
    </div>
  );
};

export default ToggleRow;
