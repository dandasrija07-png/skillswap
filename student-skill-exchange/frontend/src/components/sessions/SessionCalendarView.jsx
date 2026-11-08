import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Video, Clock } from 'lucide-react';

export default function SessionCalendarView({
  sessions,
  onSelectSession,
}) {
  // Calendar state: Year and Month (0-indexed)
  // Default to November 2026 as per workspace reference time
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 10 is November (0-indexed)
  const [selectedDateStr, setSelectedDateStr] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Group sessions by date string YYYY-MM-DD
  const sessionsByDate = {};
  sessions.forEach((s) => {
    if (!sessionsByDate[s.sessionDate]) {
      sessionsByDate[s.sessionDate] = [];
    }
    sessionsByDate[s.sessionDate].push(s);
  });

  // Build grid cells
  const gridCells = [];
  // Empty slots before 1st of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    gridCells.push(null);
  }
  // Days of month
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const fullDate = `${currentYear}-${monthStr}-${dayStr}`;
    gridCells.push({
      dayNumber: day,
      dateStr: fullDate,
      sessionsOnDay: sessionsByDate[fullDate] || [],
    });
  }

  const selectedDaySessions = selectedDateStr ? sessionsByDate[selectedDateStr] || [] : [];

  return (
    <div className="calendar-view-container">
      {/* Month Navigation */}
      <div className="calendar-month-header">
        <h3 className="calendar-month-title">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="view-toggle-btn"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="view-toggle-btn"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Header */}
      <div className="calendar-grid-header">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="calendar-grid-days">
        {gridCells.map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                style={{ minHeight: '85px', background: '#fafafa', borderRadius: '12px', opacity: 0.4 }}
              />
            );
          }

          const isSelected = selectedDateStr === cell.dateStr;
          const hasSessions = cell.sessionsOnDay.length > 0;

          return (
            <div
              key={cell.dateStr}
              className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${hasSessions ? 'has-session' : ''}`}
              onClick={() => setSelectedDateStr(cell.dateStr)}
            >
              <div className="calendar-day-number">{cell.dayNumber}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {cell.sessionsOnDay.map((s) => (
                  <div
                    key={s.id}
                    className="calendar-day-session-dot"
                    title={`${s.startTime}: ${s.topic}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectSession) onSelectSession(s);
                    }}
                  >
                    {s.startTime} {s.topic}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Agenda Drawer */}
      {selectedDateStr && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            background: '#faf5ff',
            borderRadius: '16px',
            border: '1px solid #ddd6fe',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
              Sessions on {selectedDateStr} ({selectedDaySessions.length})
            </h4>
            <button
              type="button"
              onClick={() => setSelectedDateStr(null)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>

          {selectedDaySessions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {selectedDaySessions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '0.85rem 1rem',
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #ede9fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{s.topic}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      With {s.partnerName} • {s.startTime} - {s.endTime} ({s.durationMinutes} mins)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectSession(s)}
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              No sessions scheduled for this date.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

