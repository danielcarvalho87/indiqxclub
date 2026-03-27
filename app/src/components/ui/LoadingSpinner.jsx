import React from "react";
import logoIcon from "../../assets/LOGO-icon.svg";

export const LoadingSpinner = ({
  size = 64,
  message = "Carregando...",
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <img
        src={logoIcon}
        alt="Carregando..."
        className="animate-pulse drop-shadow-[0_0_15px_rgba(95,197,235,0.5)]"
        style={{ width: size, height: size }}
      />
      {message && (
        <p className="mt-6 text-brand-muted text-sm font-medium tracking-widest uppercase animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[300px]">
      {content}
    </div>
  );
};
