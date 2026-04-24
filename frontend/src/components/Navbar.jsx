import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [user, setUser]               = useState(null);
  const [searchWhere, setSearchWhere] = useState("");
  const [searchDates, setSearchDates] = useState("");
  const [searchGuests, setSearchGuests] = useState("");

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setIsLoggedIn(false);
      setUser(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setIsLoggedIn(true);
      setUser(parsedUser);
    } catch (error) {
      console.warn("Invalid 'user' value in localStorage. Clearing auth.", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    if (location.pathname !== "/search") return;
    const params = new URLSearchParams(location.search);
    setSearchWhere(params.get("q") || "");
    setSearchDates(params.get("dates") || "");
    setSearchGuests(params.get("guests") || "");
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => {
      setProfileOpen(false);
      setNotificationsOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setProfileOpen(false);
    navigate('/');
  };

  const getUserInitial = () => {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user && user.name) {
      return user.name.split(' ')[0];
    }
    return 'User';
  };

  const submitSearch = () => {
    const params = new URLSearchParams();
    const trimmedWhere = searchWhere.trim();
    if (trimmedWhere) params.set("q", trimmedWhere);

    const trimmedDates = searchDates.trim();
    if (trimmedDates) params.set("dates", trimmedDates);

    const guestsNum = Number.parseInt(searchGuests, 10);
    if (Number.isFinite(guestsNum) && guestsNum > 0) params.set("guests", String(guestsNum));

    const qs = params.toString();
    setMobileOpen(false);
    navigate(`/search${qs ? `?${qs}` : ""}`);
  };

  return (
    <div
      className="navbar px-3 md:px-6 relative"
      style={{
        position: "sticky", top: 0, zIndex: 999,
        backgroundColor: "#FAFAF8",
        borderBottom: scrolled ? "1px solid rgba(26,26,24,0.12)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 24px rgba(26,26,24,0.10)" : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* -- LEFT -- */}
      <div className="navbar-start gap-2">
        <button
          className="lg:hidden flex items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1.5px solid rgba(26,26,24,0.15)", background: "transparent", cursor: "pointer" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#1A1A18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h8m-8 6h16"} />
          </svg>
        </button>
        <span
          onClick={() => navigate("/")}
          className="text-xl font-bold cursor-pointer"
          style={{ fontFamily: "Georgia,serif", color: "#1A1A18" }}
        >
          EasyStay
        </span>
      </div>

      {/* -- CENTER: Search -- */}
      <div className="navbar-center hidden lg:flex">
        <form
          className="flex items-center gap-2 rounded-full px-4 py-2"
          style={{ border: "1.5px solid rgba(26,26,24,0.2)", background: "#FAFAF8", width: "380px" }}
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch();
          }}
        >
          <button
            type="submit"
            aria-label="Search"
            className="flex items-center justify-center"
            style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#1A1A18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Where to?"
            value={searchWhere}
            onChange={(e) => setSearchWhere(e.target.value)}
            className="outline-none bg-transparent text-sm w-24"
            style={{ color: "#1A1A18", border: "none" }}
          />
          <span style={{ color: "rgba(26,26,24,0.2)" }}>|</span>
          <input
            type="text"
            placeholder="Dates"
            value={searchDates}
            onChange={(e) => setSearchDates(e.target.value)}
            className="outline-none bg-transparent text-sm w-16"
            style={{ color: "#1A1A18", border: "none" }}
          />
          <span style={{ color: "rgba(26,26,24,0.2)" }}>|</span>
          <input
            type="text"
            placeholder="Guests"
            value={searchGuests}
            onChange={(e) => setSearchGuests(e.target.value)}
            className="outline-none bg-transparent text-sm w-16"
            style={{ color: "#1A1A18", border: "none" }}
          />
        </form>
      </div>

      {/* -- RIGHT -- */}
      <div className="navbar-end flex items-center gap-2">

        {/* Notifications - Only show when logged in */}
        {isLoggedIn && (
          <div className="relative hidden md:block" onClick={e => e.stopPropagation()}>
            <button
              className="flex items-center justify-center rounded-full transition-all duration-200"
              style={{ width: "36px", height: "36px", border: "1.5px solid rgba(26,26,24,0.15)", background: "transparent", cursor: "pointer" }}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#1A1A18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0" />
              </svg>
            </button>
            <span className="absolute -top-1 -right-1 flex items-center justify-center text-[10px] font-bold rounded-full"
              style={{ width: "16px", height: "16px", background: "#E24B4A", color: "#FAFAF8" }}>3</span>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 py-1 rounded-xl"
                style={{
                  width: "280px",
                  background: "#FAFAF8",
                  border: "1px solid rgba(26,26,24,0.12)",
                  zIndex: 999,
                  boxShadow: "0 12px 40px rgba(26,26,24,0.12)",
                  animation: "fadeDown 0.2s ease"
                }}
              >
                <div className="px-4 py-2 border-b" style={{ borderColor: "rgba(26,26,24,0.08)" }}>
                  <p className="text-sm font-semibold" style={{ color: "#1A1A18" }}>Notifications</p>
                </div>
                <button
                  className="w-full text-left px-4 py-3 text-sm transition-all duration-150"
                  style={{ color: "#1A1A18", background: "transparent", border: "none", cursor: "pointer" }}
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate("/my-trips");
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                >
                  New booking update available. View your trips.
                </button>
                <button
                  className="w-full text-left px-4 py-3 text-sm transition-all duration-150"
                  style={{ color: "#1A1A18", background: "transparent", border: "none", cursor: "pointer" }}
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate("/messages");
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                >
                  You may have unread messages from hosts.
                </button>
                <button
                  className="w-full text-left px-4 py-3 text-sm transition-all duration-150"
                  style={{ color: "#1A1A18", background: "transparent", border: "none", cursor: "pointer" }}
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate("/settings");
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                >
                  Manage notification preferences in account settings.
                </button>
              </div>
            )}
          </div>
        )}

        {/* Messages - Only show when logged in */}
        {isLoggedIn && (
          <button
            className="hidden md:flex items-center justify-center rounded-full transition-all duration-200"
            style={{ width: "36px", height: "36px", border: "1.5px solid rgba(26,26,24,0.15)", background: "transparent", cursor: "pointer" }}
            onClick={() => navigate("/messages")}
            onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#1A1A18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>
        )}

        {/* Profile */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-200"
            style={{ border: "1.5px solid rgba(26,26,24,0.2)", background: "transparent", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="#1A1A18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
            <div className="flex items-center justify-center rounded-full text-xs font-bold"
              style={{ width: "28px", height: "28px", background: "#1A1A18", color: "#FAFAF8" }}>
              {getUserInitial()}
            </div>
          </button>

          {profileOpen && (
            <ul
              className="absolute right-0 mt-2 py-1 rounded-xl"
              style={{ width: "240px", background: "#FAFAF8", border: "1px solid rgba(26,26,24,0.12)", zIndex: 999, listStyle: "none", boxShadow: "0 12px 40px rgba(26,26,24,0.12)", animation: "fadeDown 0.2s ease" }}
            >
              {isLoggedIn ? (
                <>
                  {/* Welcome message */}
                  <li className="px-4 py-2 border-b" style={{ borderColor: "rgba(26,26,24,0.08)" }}>
                    <p className="text-sm font-semibold" style={{ color: "#1A1A18" }}>Welcome, {getUserName()}!</p>
                    <p className="text-xs" style={{ color: "#6B6B68" }}>{user?.email}</p>
                  </li>

                  {/* My Profile */}
                  <li>
                    <span
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/profile");
                      }}
                      style={{ display: "block", padding: "10px 14px", fontSize: "13px", color: "#1A1A18", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s ease" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                    >
                      {"\u{1F464}"} My Profile
                    </span>
                  </li>
                  
                  {/* My Trips - User Bookings */}
                  <li>
                    <span
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/my-trips");
                      }}
                      style={{ display: "block", padding: "10px 14px", fontSize: "13px", color: "#1A1A18", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s ease" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                    >
                      {"\u{1F3DD}\u{FE0F}"} My Trips
                    </span>
                  </li>
                  
                  {/* Wishlist */}
                  <li>
                    <span
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/wishlist");
                      }}
                      style={{ display: "block", padding: "10px 14px", fontSize: "13px", color: "#1A1A18", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s ease" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                    >
                      {"\u{2764}\u{FE0F}"} Wishlist
                    </span>
                  </li>
                  
                  {/* Messages */}
                  <li>
                    <span
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/messages");
                      }}
                      style={{ display: "block", padding: "10px 14px", fontSize: "13px", color: "#1A1A18", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s ease" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                    >
                      {"\u{1F4AC}"} Messages
                    </span>
                  </li>
                  
                  {/* Host Dashboard - Only show if user is a host */}
                  {user?.role === 'host' && (
                    <>
                      <li>
                        <span
                          onClick={() => {
                            setProfileOpen(false);
                            navigate("/host-dashboard");
                          }}
                          style={{ display: "block", padding: "10px 14px", fontSize: "13px", color: "#1A1A18", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s ease" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                        >
                  {"\u{1F3E0}"} Host Dashboard
                        </span>
                      </li>
                      <li>
                        <span
                          onClick={() => {
                            setProfileOpen(false);
                            navigate("/add-property");
                          }}
                          style={{ display: "block", padding: "10px 14px", fontSize: "13px", color: "#1A1A18", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s ease" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                        >
                          {"\u{2795}"} Add Property
                        </span>
                      </li>
                    </>
                  )}
                  
                  {/* Account Settings */}
                  <li>
                    <span
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/settings");
                      }}
                      style={{ display: "block", padding: "10px 14px", fontSize: "13px", color: "#1A1A18", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s ease" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                    >
                      {"\u{2699}\u{FE0F}"} Account Settings
                    </span>
                  </li>
                  
                  <li><hr style={{ margin: "4px 8px", borderColor: "rgba(26,26,24,0.08)" }} /></li>
                  
                  {/* Logout */}
                  <li>
                    <span
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm font-bold cursor-pointer transition-all duration-150"
                      style={{ color: "#E24B4A" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#E24B4A"; e.currentTarget.style.color = "#FAFAF8"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#E24B4A"; }}
                    >
                {"\u{1F6AA}"} Logout
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <span
                      onClick={() => { setProfileOpen(false); navigate("/login"); }}
                      className="block px-4 py-2 text-sm font-bold cursor-pointer transition-all duration-150"
                      style={{ color: "#1A1A18" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                    >
                {"\u{1F510}"} Login
                    </span>
                  </li>
                  <li>
                    <span
                      onClick={() => { setProfileOpen(false); navigate("/register"); }}
                      className="block px-4 py-2 text-sm cursor-pointer transition-all duration-150"
                      style={{ color: "#1A1A18" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                    >
                {"\u{1F4DD}"} Sign Up
                    </span>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* -- MOBILE MENU -- */}
      {mobileOpen && (
        <div
          className="lg:hidden absolute top-full left-0 right-0 flex flex-col gap-1 px-4 py-3 shadow-md"
          style={{ background: "#FAFAF8", borderTop: "1px solid rgba(26,26,24,0.1)", zIndex: 98, animation: "slideDown 0.25s ease" }}
        >
          <form
            className="flex items-center gap-2 rounded-full px-3 py-2 mb-2"
            style={{ border: "1.5px solid rgba(26,26,24,0.2)" }}
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            <button
              type="submit"
              aria-label="Search"
              className="flex items-center justify-center"
              style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#1A1A18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Where to?"
              value={searchWhere}
              onChange={(e) => setSearchWhere(e.target.value)}
              className="outline-none bg-transparent text-xs flex-1"
              style={{ color: "#1A1A18", border: "none" }}
            />
            <span style={{ color: "rgba(26,26,24,0.2)" }}>|</span>
            <input
              type="text"
              placeholder="Dates"
              value={searchDates}
              onChange={(e) => setSearchDates(e.target.value)}
              className="outline-none bg-transparent text-xs w-12"
              style={{ color: "#1A1A18", border: "none" }}
            />
            <span style={{ color: "rgba(26,26,24,0.2)" }}>|</span>
            <input
              type="text"
              placeholder="Guests"
              value={searchGuests}
              onChange={(e) => setSearchGuests(e.target.value)}
              className="outline-none bg-transparent text-xs w-10"
              style={{ color: "#1A1A18", border: "none" }}
            />
          </form>

          {["Home", "Explore", "My Trips", "Wishlist"].map(link => (
            <span key={link}
              onClick={() => { 
                setMobileOpen(false); 
                if (link === "Home") navigate("/");
                if (link === "Explore") navigate("/properties");
                if (link === "My Trips") navigate("/my-trips");
                if (link === "Wishlist") navigate("/wishlist");
              }}
              className="block px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all duration-150"
              style={{ color: "#1A1A18" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
            >{link}</span>
          ))}

          <hr style={{ margin: "4px 0", borderColor: "rgba(26,26,24,0.08)" }} />

          {isLoggedIn ? (
            <>
              {user?.role === 'host' && (
                <span
                  onClick={() => { setMobileOpen(false); navigate("/host-dashboard"); }}
                  className="block px-4 py-2.5 text-sm font-bold rounded-lg cursor-pointer transition-all duration-150"
                  style={{ color: "#1A1A18" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
                >
                  {"\u{1F3E0}"} Host Dashboard
                </span>
              )}
              <span
                onClick={handleLogout}
                className="block px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-150"
                style={{ color: "#E24B4A" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#E24B4A"; e.currentTarget.style.color = "#FAFAF8"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#E24B4A"; }}
              >
                {"\u{1F6AA}"} Logout
              </span>
            </>
          ) : (
            <>
              <span
                onClick={() => { setMobileOpen(false); navigate("/login"); }}
                className="block px-4 py-2.5 text-sm font-bold rounded-lg cursor-pointer transition-all duration-150"
                style={{ color: "#1A1A18" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
              >
                {"\u{1F510}"} Login
              </span>
              <span
                onClick={() => { setMobileOpen(false); navigate("/register"); }}
                className="block px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-150"
                style={{ color: "#1A1A18" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1A1A18"; e.currentTarget.style.color = "#FAFAF8"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A1A18"; }}
              >
                {"\u{1F4DD}"} Sign Up
              </span>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #B4B2A9; }
      `}</style>
    </div>
  );
}
