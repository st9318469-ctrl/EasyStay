import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

export default function AvailabilityCalendar({ propertyId, onDateSelect }) {
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchCalendar = useCallback(async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}/api/properties/${propertyId}/calendar`,
        { params: { year: currentYear, month: currentMonth } }
      );

      setCalendar(response.data?.calendar || []);
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
      setError('Failed to load calendar events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [propertyId, currentMonth, currentYear]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handleDateClick = (date, isAvailable) => {
    if (isAvailable) {
      setSelectedDate(date);
      if (onDateSelect) {
        onDateSelect(date);
      }
    }
  };

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    }
  };

  const getDayStyles = (day) => {
    if (!day.isAvailable) {
      return { background: "#FEE2E2", color: "#E24B4A", cursor: "not-allowed" };
    }
    if (selectedDate === day.date) {
      return { background: "#1A1A18", color: "#FAFAF8" };
    }
    return { background: "#FAFAF8", color: "#1A1A18", cursor: "pointer" };
  };

  const renderDayNumber = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('T')[0].split('-');
    return parseInt(parts[2], 10);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border text-center" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
        <p className="text-sm font-medium" style={{ color: "#5F5E5A" }}>Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border text-center" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button
          onClick={fetchCalendar}
          className="px-4 py-1.5 text-xs rounded-lg font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "#1A1A18" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
      {/* Month Header Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => handleMonthChange('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          ←
        </button>
        <h3 className="font-semibold" style={{ color: "#1A1A18" }}>
          {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => handleMonthChange('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium py-2" style={{ color: "#B4B2A9" }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendar.map((day, index) => (
          <button
            key={day.date || index}
            onClick={() => handleDateClick(day.date, day.isAvailable)}
            disabled={!day.isAvailable}
            className="aspect-square rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center"
            style={getDayStyles(day)}
          >
            {renderDayNumber(day.date)}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t flex gap-4 text-xs" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: "#FAFAF8", border: "1px solid #1A1A18" }}></div>
          <span style={{ color: "#5F5E5A" }}>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: "#FEE2E2" }}></div>
          <span style={{ color: "#5F5E5A" }}>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: "#1A1A18" }}></div>
          <span style={{ color: "#5F5E5A" }}>Selected</span>
        </div>
      </div>
    </div>
  );
}