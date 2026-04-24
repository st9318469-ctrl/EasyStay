import React from "react";

export default function StarRating({
  rating = 0,
  onChange,
  readonly = false,
  size = 16,
}) {
  const current = Number(rating) || 0;

  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${current} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = current >= value;
        return (
          <button
            key={value}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(value)}
            className={readonly ? "cursor-default" : "cursor-pointer"}
            style={{
              width: size + 4,
              height: size + 4,
              padding: 0,
              border: "none",
              background: "transparent",
              lineHeight: 0,
            }}
            aria-label={readonly ? undefined : `Set rating to ${value}`}
            title={readonly ? undefined : `${value} star`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={filled ? "#1A1A18" : "none"}
              stroke="#1A1A18"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

