import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';

/**
 * Build a list of dates from `daysBack` ago through `daysForward` from today.
 */
const getDateRange = (daysBack = 90, daysForward = 0) => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - daysBack);
  const end = new Date(today);
  end.setDate(end.getDate() + daysForward);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
};

const DateScroller = ({
  daysBack = 90,
  daysForward = 0,
  selectedDate,
  onSelect,
  datesWithData = [],
  streakDays = 0,
}) => {
  const scrollRef = useRef(null);
  const selectedRef = useRef(null);
  const dates = getDateRange(daysBack, daysForward);
  const dateSet = new Set(Array.isArray(datesWithData) ? datesWithData : []);

  // Scroll selected date into view when selection changes
  useEffect(() => {
    if (!selectedRef.current || !scrollRef.current) return;
    selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedDate]);

  return (
    <div
      className="mb-4 p-3 bg-white"
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <p className="text-muted mb-0 fw-bold">Select Date</p>
        <div
          className="fw-bold"
          style={{
            fontSize: '0.9rem',
            color: streakDays > 0 ? '#00b894' : '#636e72',
            whiteSpace: 'nowrap',
          }}
          title={
            streakDays > 0
              ? `You have logged metrics for ${streakDays} consecutive day${streakDays === 1 ? '' : 's'} (including today).`
              : 'Log at least one metric today to start a streak.'
          }
        >
          <span
            aria-hidden="true"
            style={{
              marginRight: '6px',
              filter: streakDays > 0 ? 'drop-shadow(0 1px 0 rgba(0,0,0,0.08))' : 'none',
              opacity: streakDays > 0 ? 1 : 0.45,
            }}
            title="Streak"
          >
           
          </span>
           {streakDays}  🔥
        </div>
      </div>
      <div
        ref={scrollRef}
        className="d-flex overflow-auto"
        style={{ gap: '10px', paddingBottom: '8px', minHeight: '44px' }}
      >
        {dates.map((d) => {
          const key = d.toISOString();
          const dateStr = d.toDateString();
          const isSelected = selectedDate && dateStr === selectedDate.toDateString();
          const hasData = dateSet.has(dateStr);
          return (
            <button
              key={key}
              ref={isSelected ? selectedRef : null}
              className="btn btn-sm fw-bold px-3 py-2 rounded-pill"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #00b894, #6c5ce7)'
                  : hasData
                  ? 'linear-gradient(135deg, rgba(0,184,148,0.25), rgba(108,92,231,0.25))'
                  : '#e9ecef',
                color: isSelected ? '#fff' : hasData ? '#00b894' : '#2d3436',
                border: isSelected
                  ? 'none'
                  : hasData
                  ? '2px solid #00b894'
                  : '1px solid #dfe6e9',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
              onClick={() => onSelect(d)}
              title={hasData ? 'Has logged data' : 'No data yet'}
            >
              {format(d, 'MMM d')}
              {hasData && !isSelected && (
                <span className="ms-1" style={{ fontSize: '0.65rem' }} title="Logged">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateScroller;
