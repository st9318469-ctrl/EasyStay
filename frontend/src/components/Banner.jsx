import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Banner() {
  const navigate = useNavigate();
  const [location, setLocation]   = useState("");
  const [checkIn, setCheckIn]     = useState("");
  const [checkOut, setCheckOut]   = useState("");
  const [guests, setGuests]       = useState("");
  const [activeTag, setActiveTag] = useState("");

  const tags = ["\u{1F3D6}\u{FE0F} Beach", "\u{1F3D4}\u{FE0F} Mountain", "\u{1F3D9}\u{FE0F} City", "\u{1F48E} Luxury", "\u{1F33F} Cabin"];

  const handleSearch = () => {
    const params = new URLSearchParams();
    const trimmed = location.trim();
    if (trimmed) params.set("q", trimmed);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);

    const guestsNum = Number.parseInt(String(guests), 10);
    if (Number.isFinite(guestsNum) && guestsNum > 0) params.set("guests", String(guestsNum));

    const qs = params.toString();
    navigate(`/search${qs ? `?${qs}` : ""}`);
  };

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">

      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1800&auto=format&fit=crop&q=80"
        alt="Maldives overwater bungalow"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(26,26,24,0.52)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center gap-4 sm:gap-5">

        {/* Badge */}
        <div
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-medium tracking-widest uppercase"
          style={{
            backgroundColor: "rgba(250,250,248,0.15)",
            border: "1px solid rgba(250,250,248,0.35)",
            color: "#FAFAF8",
            animation: "fadeUp 0.6s ease both",
          }}
        >
          {"\u2726"} Discover Unique Stays Worldwide
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: "clamp(2rem, 6vw, 5rem)",
            fontWeight: "800",
            color: "#FAFAF8",
            lineHeight: "1.15",
            letterSpacing: "-0.5px",
            animation: "fadeUp 0.7s ease 0.1s both",
          }}
        >
          Where to next?
        </h1>

        <p
          style={{
            color: "rgba(250,250,248,0.75)",
            fontSize: "clamp(0.8rem, 2vw, 1.05rem)",
            maxWidth: "420px",
            animation: "fadeUp 0.8s ease 0.15s both",
          }}
        >
          Discover homes, villas & cabins {"\u2014"} curated for every kind of traveler.
        </p>

        {/* Search Card */}
        <form
          className="w-full max-w-2xl rounded-2xl"
          style={{
            backgroundColor: "#FAFAF8",
            padding: "16px 18px",
            boxShadow: "0 12px 48px rgba(26,26,24,0.35)",
            animation: "fadeUp 0.9s ease 0.2s both",
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          {/* Destination */}
          <div
            style={{
              borderBottom: "1px solid rgba(26,26,24,0.10)",
              paddingBottom: "12px",
              marginBottom: "12px",
              textAlign: "left",
            }}
          >
            <label style={{
              fontSize: "10px", fontWeight: "700", color: "#1A1A18",
              letterSpacing: "0.12em", textTransform: "uppercase",
              display: "block", marginBottom: "4px",
            }}>
              Destination
            </label>
            <input
              type="text"
              placeholder="Search destinations..."
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="outline-none bg-transparent w-full"
              style={{ fontSize: "14px", color: "#1A1A18", fontWeight: "500" }}
            />
          </div>

          {/* FIX 1: Check In / Check Out stacked on mobile, side by side on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">

            {/* Check In */}
            <div style={{ textAlign: "left" }}>
              <label style={{
                fontSize: "10px", fontWeight: "700", color: "#1A1A18",
                letterSpacing: "0.12em", textTransform: "uppercase",
                display: "block", marginBottom: "4px",
              }}>
                Check In
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                className="outline-none bg-transparent w-full"
                style={{ fontSize: "12px", color: checkIn ? "#1A1A18" : "#B4B2A9" }}
              />
            </div>

            {/* Check Out */}
            <div style={{ textAlign: "left" }}>
              <label style={{
                fontSize: "10px", fontWeight: "700", color: "#1A1A18",
                letterSpacing: "0.12em", textTransform: "uppercase",
                display: "block", marginBottom: "4px",
              }}>
                Check Out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                className="outline-none bg-transparent w-full"
                style={{ fontSize: "12px", color: checkOut ? "#1A1A18" : "#B4B2A9" }}
              />
            </div>

            {/* Guests */}
            <div style={{ textAlign: "left" }}>
              <label style={{
                fontSize: "10px", fontWeight: "700", color: "#1A1A18",
                letterSpacing: "0.12em", textTransform: "uppercase",
                display: "block", marginBottom: "4px",
              }}>
                Guests
              </label>
              <input
                type="number"
                placeholder="Add guests"
                min="1"
                value={guests}
                onChange={e => setGuests(e.target.value)}
                className="outline-none bg-transparent w-full"
                style={{ fontSize: "12px", color: "#1A1A18" }}
              />
            </div>

            {/* FIX 3: Search button full width on mobile */}
            <button
              type="submit"
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 w-full"
              style={{
                backgroundColor: "#1A1A18",
                color: "#FAFAF8",
                padding: "11px 18px",
                fontSize: "13px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(26,26,24,0.25)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                viewBox="0 0 24 24" stroke="#FAFAF8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              Search
            </button>

          </div>
        </form>

        {/* Filter Tags */}
        <div
          className="flex flex-wrap justify-center gap-2"
          style={{ animation: "fadeUp 1s ease 0.3s both" }}
        >
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className="transition-all duration-200 hover:scale-105"
              style={{
                padding: "5px 12px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: "500",
                cursor: "pointer",
                border: "1px solid rgba(250,250,248,0.4)",
                backgroundColor: activeTag === tag ? "#FAFAF8" : "rgba(250,250,248,0.15)",
                color: activeTag === tag ? "#1A1A18" : "#FAFAF8",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* FIX 2: Stats — hidden on mobile, show sm+ */}
        <div
          className="hidden sm:flex gap-8 md:gap-12"
          style={{ animation: "fadeUp 1.1s ease 0.4s both" }}
        >
          {[
            { value: "10K+", label: "Properties" },
            { value: "50K+", label: "Happy Guests" },
            { value: "120+", label: "Cities" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p style={{
                fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
                fontWeight: "700",
                color: "#FAFAF8",
                fontFamily: "'Georgia', serif",
              }}>
                {stat.value}
              </p>
              <p style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(250,250,248,0.65)",
                marginTop: "2px",
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Scroll Indicator — hidden on mobile */}
      <div
        className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1"
        style={{ color: "rgba(250,250,248,0.6)", animation: "bounce 2s infinite" }}
      >
        <span style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Scroll
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
          viewBox="0 0 24 24" stroke="rgba(250,250,248,0.6)">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(7px); }
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.4);
          cursor: pointer;
        }
        input::placeholder { color: #B4B2A9; }
      `}</style>

    </section>
  );
}
