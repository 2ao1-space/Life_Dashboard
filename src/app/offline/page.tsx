"use client";

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0d0d",
        color: "#f0f0f0",
        fontFamily: "Cairo, sans-serif",
        gap: 16,
        textAlign: "center",
        padding: 24,
      }}
    >
      <div style={{ fontSize: 64 }}>📵</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>
        لا يوجد اتصال بالإنترنت
      </h1>
      <p
        style={{ fontSize: 14, color: "#888", maxWidth: 280, lineHeight: 1.7 }}
      >
        تأكد من اتصالك بالنت ثم حاول مرة أخرى.
        <br />
        بياناتك محفوظة محلياً على جهازك.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 8,
          padding: "12px 28px",
          background: "#c9a84c",
          color: "#0d0d0d",
          border: "none",
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "Cairo, sans-serif",
        }}
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
