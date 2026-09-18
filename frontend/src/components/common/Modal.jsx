import React, { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen = true, title, children, onClose, maxWidth = "540px" }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (isOpen === false) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: maxWidth,
          backgroundColor: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
          overflow: "hidden",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 100000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #21262d",
            backgroundColor: "#0d1117"
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              color: "#58a6ff",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {title || "Dialog"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#8b949e",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.15s, background 0.15s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#f0f6fc";
              e.currentTarget.style.backgroundColor = "#21262d";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#8b949e";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px",
            overflowY: "auto"
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
