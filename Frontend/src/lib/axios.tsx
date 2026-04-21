import axios from "axios";
import { toast } from "sonner";
import { useState, useEffect } from "react";

// ---- Rate Limit Countdown Toast Component ----
const RateLimitToast = ({
  message,
  seconds,
  toastId,
}: {
  message: string;
  seconds: number;
  toastId: string | number;
}) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.dismiss(toastId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [toastId]);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #dc2626, #b91c1c)",
        color: "#fff",
        padding: "14px 18px",
        borderRadius: "10px",
        boxShadow: "0 8px 24px rgba(220, 38, 38, 0.35)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        minWidth: "320px",
        fontFamily: "inherit",
      }}
    >
      {/* Countdown circle */}
      <div
        style={{
          minWidth: "44px",
          minHeight: "44px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: 700,
        }}
      >
        {remaining}s
      </div>

      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "14px",
            letterSpacing: "0.01em",
          }}
        >
          🚦 Too Many Requests
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "12.5px",
            opacity: 0.9,
            lineHeight: 1.4,
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

// ---- Axios Instance ----
const api = axios.create();

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const message =
        error.response.data?.message ||
        "Too many requests. Please slow down and try again shortly.";

      // Parse wait time from Retry-After header (seconds)
      const retryAfter = parseInt(error.response.headers["retry-after"], 10);
      const seconds = isNaN(retryAfter) || retryAfter <= 0 ? 60 : retryAfter;

      // Dismiss any existing rate-limit toast before showing a new one
      toast.dismiss("rate-limit-toast");

      toast.custom(
        (id) => (
          <RateLimitToast message={message} seconds={seconds} toastId={id} />
        ),
        {
          id: "rate-limit-toast",
          duration: seconds * 1000,
        }
      );
    }

    return Promise.reject(error);
  }
);

export default api;
