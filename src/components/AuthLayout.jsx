import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="premium-page min-h-screen flex items-center justify-center px-5 py-10 font-inter">
      <div className="club-vignette" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 border border-white/12 bg-white/[0.06] shadow-2xl">
            <Icon className="w-7 h-7" style={{ color: '#9D4EDD' }} aria-hidden="true" />
          </div>
          <p className="text-label mb-2">NeonValley</p>
          <h1 className="text-[32px] font-extrabold tracking-0 text-white">{title}</h1>
          {subtitle && <p className="text-white/50 mt-2 text-sm">{subtitle}</p>}
        </div>
        <div className="hero-glass rounded-[28px] p-7">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-white/45 mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}
