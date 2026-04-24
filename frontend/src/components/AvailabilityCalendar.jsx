import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AvailabilityCalendar({ propertyId, onDateSelect }) {
    const [calendar, setCalendar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        fetchCalendar();
    }, [currentMonth, currentYear]);

    const fetchCalendar = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/properties/${propertyId}/calendar`, {
                params: { year: currentYear, month: currentMonth }
            });
            setCalendar(response.data.calendar);
        } catch (error) {
            console.error('Failed to fetch calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (date, isAvailable) => {
        if (isAvailable) {
            setSelectedDate(date);
            onDateSelect(date);
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

    if (loading) return <div className="text-center py-4">Loading calendar...</div>;

    return (
        <div className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(26,26,24,0.12)" }}>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => {
                        if (currentMonth === 1) {
                            setCurrentMonth(12);
                            setCurrentYear(currentYear - 1);
                        } else {
                            setCurrentMonth(currentMonth - 1);
                        }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    ←
                </button>
                <h3 className="font-semibold" style={{ color: "#1A1A18" }}>
                    {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                    onClick={() => {
                        if (currentMonth === 12) {
                            setCurrentMonth(1);
                            setCurrentYear(currentYear + 1);
                        } else {
                            setCurrentMonth(currentMonth + 1);
                        }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    →
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium py-2" style={{ color: "#B4B2A9" }}>
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {calendar.map((day, index) => (
                    <button
                        key={index}
                        onClick={() => handleDateClick(day.date, day.isAvailable)}
                        disabled={!day.isAvailable}
                        className="aspect-square rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                        style={getDayStyles(day)}
                    >
                        {new Date(day.date).getDate()}
                    </button>
                ))}
            </div>

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