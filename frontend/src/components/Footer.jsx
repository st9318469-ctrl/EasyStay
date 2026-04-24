export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#1A1A18" }} className="px-6 py-10 sm:py-14">
      <div className="max-w-6xl mx-auto">

        {/* ── Top section ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <p style={{ fontSize: "22px", fontWeight: "800", color: "#FAFAF8", fontFamily: "Georgia, serif", marginBottom: "10px" }}>
              EasyStay
            </p>
            <p style={{ fontSize: "13px", color: "#B4B2A9", lineHeight: "1.8" }}>
              Discover unique homes, villas & cabins curated for every kind of traveler.
            </p>
          </div>

          {/* Company */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#FAFAF8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
              Company
            </p>
            <div className="flex flex-col gap-3">
              {["About us", "Contact", "Jobs", "Press kit"].map(link => (
                <a key={link} className="link link-hover"
                  style={{ fontSize: "13px", color: "#B4B2A9", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#FAFAF8"}
                  onMouseLeave={e => e.currentTarget.style.color = "#B4B2A9"}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#FAFAF8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
              Support
            </p>
            <div className="flex flex-col gap-3">
              {["Help Center", "Safety", "Cancellation", "Contact"].map(link => (
                <a key={link} className="link link-hover"
                  style={{ fontSize: "13px", color: "#B4B2A9", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#FAFAF8"}
                  onMouseLeave={e => e.currentTarget.style.color = "#B4B2A9"}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Hosting */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#FAFAF8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
              Hosting
            </p>
            <div className="flex flex-col gap-3">
              {["Host Resources", "Community", "Insurance"].map(link => (
                <a key={link} className="link link-hover"
                  style={{ fontSize: "13px", color: "#B4B2A9", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#FAFAF8"}
                  onMouseLeave={e => e.currentTarget.style.color = "#B4B2A9"}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: "1px solid rgba(250,250,248,0.08)", marginBottom: "20px" }} />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p style={{ fontSize: "12px", color: "#5F5E5A", textAlign: "center" }}>
            Copyright © {new Date().getFullYear()} — All rights reserved by EasyStay
          </p>

          {/* Social Icons */}
          <div className="flex gap-3">

            {/* Twitter / X */}
            <a style={{ cursor: "pointer" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24"
                style={{ fill: "#5F5E5A", transition: "fill 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.fill = "#FAFAF8"}
                onMouseLeave={e => e.currentTarget.style.fill = "#5F5E5A"}>
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>

            {/* YouTube */}
            <a style={{ cursor: "pointer" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24"
                style={{ fill: "#5F5E5A", transition: "fill 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.fill = "#FAFAF8"}
                onMouseLeave={e => e.currentTarget.style.fill = "#5F5E5A"}>
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </a>

            {/* Facebook */}
            <a style={{ cursor: "pointer" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24"
                style={{ fill: "#5F5E5A", transition: "fill 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.fill = "#FAFAF8"}
                onMouseLeave={e => e.currentTarget.style.fill = "#5F5E5A"}>
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>

          </div>

          {/* Legal */}
          <div className="flex gap-4">
            {["Privacy", "Terms", "Sitemap"].map(item => (
              <a key={item}
                style={{ fontSize: "12px", color: "#5F5E5A", cursor: "pointer", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#FAFAF8"}
                onMouseLeave={e => e.currentTarget.style.color = "#5F5E5A"}
              >
                {item}
              </a>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}
