'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

// ── SVG ICON COMPONENTS ──────────────────────────────────────
function IconLayers({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
}
function IconChat({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
}
function IconTarget({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
}
function IconInbox({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>
}
function IconChart({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
}
function IconTrending({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
}
function IconSearch({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function IconShield({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function IconFolder({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
}
function IconMicroscope({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 100-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 01-2-2V6h6v4a2 2 0 01-2 2z"/><path d="M12 6V3a1 1 0 00-1-1H9a1 1 0 00-1 1v3"/></svg>
}
function IconList({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
}
function IconUsers({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
}
function IconSend({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
}
function IconCheck({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function IconX({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function IconClock({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function IconDownload({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
function IconUpload({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
}
function IconAlertTriangle({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
}
function IconFile({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
}
function IconAward({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
}
function IconMenu({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
}

// ── DESIGN TOKENS ──────────────────────────────────────────────
const GLASS_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    background: #f4f0ea;
    font-family: 'DM Sans', sans-serif;
    color: #2c2415;
    -webkit-tap-highlight-color: transparent;
    overscroll-behavior: none;
  }

  /* ── GLASS COMPONENTS ── */
  .glass-card {
    background: rgba(255,255,255,0.38);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.55);
    border-radius: 24px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.2),
      0 4px 24px rgba(100,80,50,0.06),
      0 1px 4px rgba(100,80,50,0.04),
      inset 0 1px 0 rgba(255,255,255,0.6);
    position: relative;
    overflow: hidden;
  }

  .glass-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      rgba(255,255,255,0.35) 0%,
      rgba(255,255,255,0.05) 35%,
      rgba(255,255,255,0) 50%,
      rgba(255,255,255,0.1) 100%
    );
    pointer-events: none;
    z-index: 0;
  }

  .glass-card > * { position: relative; z-index: 1; }

  .glass-btn {
    background: rgba(255,255,255,0.45);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 14px;
    color: #3d3425;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow:
      0 2px 10px rgba(100,80,50,0.06),
      inset 0 1px 0 rgba(255,255,255,0.7);
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    touch-action: manipulation;
    -webkit-touch-callout: none;
    user-select: none;
  }

  .glass-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 55%);
    border-radius: inherit;
    pointer-events: none;
  }

  @media (hover: hover) {
    .glass-btn:hover {
      background: rgba(255,255,255,0.6);
      border-color: rgba(255,255,255,0.8);
      box-shadow: 0 6px 20px rgba(100,80,50,0.1), inset 0 1px 0 rgba(255,255,255,0.8);
      transform: translateY(-1px);
    }
  }

  .glass-btn:active {
    transform: translateY(1px) scale(0.97);
    box-shadow: 0 1px 4px rgba(100,80,50,0.06), inset 0 2px 4px rgba(0,0,0,0.04);
  }

  .glass-btn-primary {
    background: linear-gradient(135deg, rgba(122,158,126,0.88) 0%, rgba(95,135,100,0.95) 100%);
    border: 1px solid rgba(122,158,126,0.8);
    color: #fff;
    box-shadow:
      0 4px 18px rgba(122,158,126,0.3),
      0 1px 4px rgba(122,158,126,0.15),
      inset 0 1px 0 rgba(255,255,255,0.3);
  }

  .glass-btn-primary::before {
    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%);
  }

  @media (hover: hover) {
    .glass-btn-primary:hover {
      background: linear-gradient(135deg, rgba(105,148,110,0.95) 0%, rgba(80,125,85,1) 100%);
      border-color: rgba(105,148,110,0.95);
      box-shadow: 0 8px 28px rgba(122,158,126,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
      transform: translateY(-2px);
    }
  }

  .glass-btn-primary:active {
    transform: translateY(1px) scale(0.97);
    box-shadow: 0 2px 8px rgba(122,158,126,0.2), inset 0 2px 6px rgba(0,0,0,0.08);
  }

  .glass-btn-danger {
    background: rgba(184,92,82,0.1);
    border: 1px solid rgba(184,92,82,0.3);
    color: #8a3a30;
  }

  .glass-btn-danger:hover {
    background: rgba(184,92,82,0.2);
  }

  .glass-input {
    background: rgba(255,255,255,0.45);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 14px;
    padding: 14px 18px;
    color: #2c2415;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px; /* 16px prevents iOS zoom on focus */
    font-weight: 500;
    outline: none;
    transition: all 0.18s ease;
    box-shadow:
      0 1px 4px rgba(100,80,50,0.04),
      inset 0 1px 0 rgba(255,255,255,0.5);
    -webkit-appearance: none;
    appearance: none;
  }

  .glass-input:focus {
    border-color: rgba(122,158,126,0.6);
    box-shadow:
      0 0 0 3px rgba(122,158,126,0.1),
      0 2px 8px rgba(122,158,126,0.06);
    background: rgba(255,255,255,0.65);
  }

  .glass-input::placeholder {
    color: rgba(120,100,70,0.38);
    font-weight: 400;
  }

  /* ── DESKTOP SIDEBAR ── */
  .glass-sidebar {
    background: rgba(244,240,234,0.7);
    backdrop-filter: blur(30px) saturate(180%);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    border-right: 1px solid rgba(255,255,255,0.4);
    width: 260px;
    min-height: 100vh;
    padding: 28px 18px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-shrink: 0;
  }

  /* ── MOBILE BOTTOM NAV ── */
  .mobile-top-bar {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(244,240,234,0.82);
    backdrop-filter: blur(28px) saturate(200%);
    -webkit-backdrop-filter: blur(28px) saturate(200%);
    border-bottom: 1px solid rgba(255,255,255,0.5);
    padding: 0 18px;
    height: 58px;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 16px rgba(100,80,50,0.06);
  }

  .mobile-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    /* The liquid glass look: frosted + warm tint + strong border top */
    background: rgba(248,244,238,0.78);
    backdrop-filter: blur(32px) saturate(200%);
    -webkit-backdrop-filter: blur(32px) saturate(200%);
    border-top: 1px solid rgba(255,255,255,0.65);
    box-shadow:
      0 -1px 0 rgba(122,100,70,0.06),
      0 -8px 32px rgba(100,80,50,0.08),
      inset 0 1px 0 rgba(255,255,255,0.7);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
  }

  .mobile-bottom-nav-inner {
    display: flex;
    align-items: stretch;
    height: 64px;
    position: relative;
  }

  /* Subtle shine overlay on bottom nav */
  .mobile-bottom-nav::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.8) 30%,
      rgba(255,255,255,0.9) 50%,
      rgba(255,255,255,0.8) 70%,
      rgba(255,255,255,0) 100%
    );
    pointer-events: none;
  }

  .mobile-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    color: #a8957d;
    transition: all 0.18s ease;
    position: relative;
    touch-action: manipulation;
    -webkit-touch-callout: none;
    user-select: none;
    padding: 8px 4px;
    border-radius: 0;
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
  }

  .mobile-nav-item:active {
    transform: scale(0.92);
  }

  .mobile-nav-item.active {
    color: #2c5a30;
  }

  /* Active pill indicator on bottom nav */
  .mobile-nav-item.active::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 32px;
    height: 3px;
    border-radius: 99px;
    background: linear-gradient(90deg, rgba(122,158,126,0.6), rgba(95,135,100,0.9));
    box-shadow: 0 1px 6px rgba(122,158,126,0.4);
  }

  .mobile-nav-item .nav-icon-wrap {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.18s ease;
  }

  .mobile-nav-item.active .nav-icon-wrap {
    background: rgba(122,158,126,0.14);
  }

  .mobile-nav-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2px;
    line-height: 1;
  }

  .mobile-nav-badge {
    position: absolute;
    top: 6px;
    right: calc(50% - 18px);
    background: #b85c52;
    color: #fff;
    border-radius: 100px;
    font-size: 9px;
    font-weight: 700;
    padding: 1px 5px;
    min-width: 15px;
    text-align: center;
    border: 1.5px solid rgba(244,240,234,0.9);
  }

  /* ── SHEET (mobile overflow nav for extra items) ── */
  .nav-sheet-overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(44,36,21,0.25);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .nav-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 201;
    background: rgba(248,244,238,0.9);
    backdrop-filter: blur(40px) saturate(200%);
    -webkit-backdrop-filter: blur(40px) saturate(200%);
    border-top: 1px solid rgba(255,255,255,0.7);
    border-radius: 24px 24px 0 0;
    padding: 8px 20px 32px;
    box-shadow: 0 -8px 40px rgba(100,80,50,0.12);
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
  }

  .nav-sheet-handle {
    width: 36px;
    height: 4px;
    border-radius: 99px;
    background: rgba(122,100,70,0.2);
    margin: 10px auto 20px;
  }

  .nav-sheet-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 16px;
    border-radius: 16px;
    cursor: pointer;
    color: #6a5a45;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.15s ease;
    touch-action: manipulation;
    user-select: none;
    border: 1px solid transparent;
  }

  .nav-sheet-item:active {
    background: rgba(255,255,255,0.5);
    border-color: rgba(255,255,255,0.7);
    transform: scale(0.98);
  }

  .nav-sheet-item.active {
    background: rgba(122,158,126,0.1);
    border-color: rgba(122,158,126,0.25);
    color: #2c5a30;
  }

  /* ── SHARED NAV ── */
  .glass-nav-active {
    background: rgba(122,158,126,0.14) !important;
    border: 1px solid rgba(122,158,126,0.35) !important;
    color: #2c5a30 !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .glass-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-radius: 14px;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    border: 1px solid transparent;
    color: #8a7a65;
    touch-action: manipulation;
    user-select: none;
  }

  @media (hover: hover) {
    .glass-nav-item:hover {
      background: rgba(255,255,255,0.3);
      color: #2c2415;
      border-color: rgba(255,255,255,0.45);
    }
  }

  .serif-heading {
    font-family: 'DM Serif Display', serif;
    font-weight: 400;
  }

  .quiz-option-btn {
    background: rgba(255,255,255,0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.55);
    border-radius: 16px;
    padding: 16px 20px;
    color: #2c2415;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: all 0.18s cubic-bezier(0.34, 1.2, 0.64, 1);
    box-shadow:
      0 1px 4px rgba(100,80,50,0.04),
      inset 0 1px 0 rgba(255,255,255,0.6);
    position: relative;
    overflow: hidden;
    touch-action: manipulation;
    user-select: none;
    min-height: 52px;
  }

  .quiz-option-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (hover: hover) {
    .quiz-option-btn:hover {
      background: rgba(122,158,126,0.14);
      border-color: rgba(122,158,126,0.4);
      transform: translateX(4px);
      box-shadow: 0 4px 16px rgba(122,158,126,0.15);
      color: #2c5a30;
    }
  }

  .quiz-option-btn:active {
    transform: scale(0.98);
    background: rgba(122,158,126,0.2);
  }

  .badge {
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .badge-green { background: rgba(90,138,94,0.1); color: #2c5a30; border: 1px solid rgba(90,138,94,0.25); }
  .badge-amber { background: rgba(182,142,108,0.12); color: #7a5020; border: 1px solid rgba(182,142,108,0.3); }
  .badge-red { background: rgba(184,92,82,0.1); color: #8a3a30; border: 1px solid rgba(184,92,82,0.2); }
  .badge-blue { background: rgba(80,120,180,0.08); color: #2a4a7a; border: 1px solid rgba(80,120,180,0.2); }

  .tag-row {
    padding: 14px 18px;
    border-radius: 14px;
    background: rgba(255,255,255,0.3);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.45);
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  select option { background: #f4f0ea; color: #2c2415; }

  .stat-card-inner { position: relative; z-index: 1; }

  .chat-bubble-ai {
    background: rgba(255,255,255,0.5);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 18px 18px 18px 6px;
    box-shadow: 0 1px 6px rgba(100,80,50,0.04), inset 0 1px 0 rgba(255,255,255,0.5);
  }

  .chat-bubble-user {
    background: rgba(122,158,126,0.14);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(122,158,126,0.3);
    border-radius: 18px 18px 6px 18px;
  }

  .chat-avatar {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .chat-avatar-ai {
    background: linear-gradient(135deg, rgba(122,158,126,0.85) 0%, rgba(95,135,100,0.95) 100%);
    box-shadow: 0 2px 8px rgba(122,158,126,0.25), inset 0 1px 0 rgba(255,255,255,0.3);
  }

  .chat-avatar-user {
    background: rgba(255,255,255,0.6);
    border: 1px solid rgba(255,255,255,0.8);
    box-shadow: 0 1px 4px rgba(100,80,50,0.06);
    color: #8a7a65;
    font-weight: 600;
    font-size: 11px;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fade-in { animation: fadeIn 0.3s ease-out; }

  @keyframes pulse-dot {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* ── LAYOUT ── */
  .app-layout {
    display: flex;
    min-height: 100vh;
    background: #f4f0ea;
  }

  .main-content {
    flex: 1;
    padding: 40px 48px;
    overflow-y: auto;
    min-width: 0;
  }

  /* ── RESPONSIVE BREAKPOINTS ── */
  @media (max-width: 768px) {
    .glass-sidebar { display: none !important; }
    .mobile-top-bar { display: flex !important; }
    .mobile-bottom-nav { display: block !important; }

    .main-content {
      padding: 76px 16px 90px; /* top: topbar height + gap, bottom: nav height + gap */
    }

    .app-layout {
      flex-direction: column;
    }

    /* Stack stat grids on mobile */
    .stats-grid-3 {
      grid-template-columns: 1fr 1fr !important;
    }

    .stats-grid-2 {
      grid-template-columns: 1fr !important;
    }

    .quiz-grid {
      grid-template-columns: 1fr !important;
    }

    .invite-grid {
      grid-template-columns: 1fr !important;
    }

    /* Taller chat window on mobile */
    .chat-window {
      height: calc(100vh - 200px) !important;
    }

    /* Page header tighter on mobile */
    .page-header-title {
      font-size: 26px !important;
    }

    /* Hide "You" text in chat avatar on mobile */
    .chat-avatar-user-text {
      font-size: 9px;
    }

    /* Search row stack on mobile */
    .search-row {
      flex-direction: column !important;
    }

    /* Audit row tighter */
    .audit-log-row {
      flex-wrap: wrap;
      gap: 4px !important;
    }

    .audit-log-time {
      min-width: unset !important;
      width: 100%;
    }

    /* Trending chart */
    .trending-label {
      min-width: 100px !important;
    }
  }

  @media (max-width: 480px) {
    .stats-grid-3 {
      grid-template-columns: 1fr !important;
    }

    .badge {
      font-size: 10px;
      padding: 3px 8px;
    }
  }
`

// ── MOBILE HOOK ───────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(data?.role ?? 'worker')
    }
    getRole()
  }, [])

  if (!role) return (
    <>
      <style>{GLASS_STYLE}</style>
      <div style={{ background: '#f4f0ea', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", color: '#8a7a65' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(122,158,126,0.85) 0%, rgba(95,135,100,0.95) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconLayers size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Loading...</span>
        </div>
      </div>
    </>
  )

  if (role === 'admin') return <AdminDashboard />
  if (role === 'manager') return <ManagerDashboard />
  return <WorkerDashboard />
}

// ── MOBILE TOP BAR ──────────────────────────────────────────
function MobileTopBar({ title }: { title: string }) {
  return (
    <div className="mobile-top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'linear-gradient(135deg, rgba(122,158,126,0.85) 0%, rgba(95,135,100,0.95) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(122,158,126,0.25)' }}>
          <IconLayers size={15} color="#fff" />
        </div>
        <span className="serif-heading" style={{ fontSize: '17px', color: '#2c2415', letterSpacing: '-0.2px' }}>PolicyPulse</span>
      </div>
      <span style={{ fontSize: '13px', color: '#8a7a65', fontWeight: 500 }}>{title}</span>
    </div>
  )
}

// ── MOBILE BOTTOM NAV ──────────────────────────────────────
function MobileBottomNav({ items, page, setPage, onMorePress }: {
  items: Array<{ key: string; label: string; icon: React.ReactNode; badge?: number }>
  page: string
  setPage: (p: string) => void
  onMorePress?: () => void
}) {
  // Show max 4 items in bottom bar; rest go into a "More" sheet
  const visibleItems = items.slice(0, 4)
  const extraItems = items.slice(4)

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        {visibleItems.map(item => (
          <button
            key={item.key}
            className={`mobile-nav-item ${page === item.key ? 'active' : ''}`}
            onClick={() => setPage(item.key)}
            type="button"
          >
            <div className="nav-icon-wrap">
              {item.icon}
            </div>
            <span className="mobile-nav-label">{item.label}</span>
            {(item.badge ?? -1) > 0 && (
              <span className="mobile-nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
        {extraItems.length > 0 && (
          <button
            className={`mobile-nav-item ${extraItems.some(i => i.key === page) ? 'active' : ''}`}
            onClick={onMorePress}
            type="button"
          >
            <div className="nav-icon-wrap">
              <IconMenu size={18} />
            </div>
            <span className="mobile-nav-label">More</span>
          </button>
        )}
      </div>
    </nav>
  )
}

// ── MORE SHEET ───────────────────────────────────────────────
function MoreSheet({ items, page, setPage, onClose }: {
  items: Array<{ key: string; label: string; icon: React.ReactNode; badge?: number }>
  page: string
  setPage: (p: string) => void
  onClose: () => void
}) {
  return (
    <>
      <div className="nav-sheet-overlay" style={{ display: 'flex' }} onClick={onClose} />
      <div className="nav-sheet" style={{ animation: 'slideUp 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)' }}>
        <div className="nav-sheet-handle" />
        <div style={{ fontSize: '10px', color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1.4px', fontWeight: 700, padding: '0 8px 12px' }}>More</div>
        {items.map(item => (
          <div
            key={item.key}
            className={`nav-sheet-item ${page === item.key ? 'active' : ''}`}
            onClick={() => { setPage(item.key); onClose() }}
          >
            {item.icon}
            <span>{item.label}</span>
            {(item.badge ?? -1) > 0 && (
              <span style={{ marginLeft: 'auto', background: '#b85c52', color: '#fff', borderRadius: '100px', fontSize: '10px', fontWeight: 700, padding: '2px 7px' }}>
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

// ── DESKTOP SIDEBAR ──────────────────────────────────────────
function Sidebar({ role, page, setPage, navItems, badge }: {
  role: string
  page: string
  setPage: (p: string) => void
  navItems: Array<{ key: string; label: string; icon: React.ReactNode; badge?: number }>
  badge?: { label: string; color: string; bg: string; border: string }
}) {
  const roleBadge = badge ?? (
    role === 'admin' ? { label: 'Admin', color: '#2a4a7a', bg: 'rgba(80,120,180,0.08)', border: 'rgba(80,120,180,0.2)' } :
    role === 'manager' ? { label: 'Manager', color: '#7a5020', bg: 'rgba(182,142,108,0.1)', border: 'rgba(182,142,108,0.25)' } :
    { label: 'Employee', color: '#2c5a30', bg: 'rgba(122,158,126,0.1)', border: 'rgba(122,158,126,0.25)' }
  )

  return (
    <aside className="glass-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px 28px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(122,158,126,0.85) 0%, rgba(95,135,100,0.95) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(122,158,126,0.25), inset 0 1px 0 rgba(255,255,255,0.35)', flexShrink: 0 }}>
          <IconLayers size={18} color="#fff" />
        </div>
        <span className="serif-heading" style={{ fontSize: '20px', color: '#2c2415', letterSpacing: '-0.3px' }}>PolicyPulse</span>
      </div>

      <div style={{ fontSize: '10px', color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1.6px', padding: '4px 14px 10px', fontWeight: 700 }}>
        {role === 'admin' ? 'Administration' : role === 'manager' ? 'Management' : 'Workspace'}
      </div>

      {navItems.map(item => (
        <div key={item.key} className={`glass-nav-item ${page === item.key ? 'glass-nav-active' : ''}`} onClick={() => setPage(item.key)}>
          {item.icon}
          <span>{item.label}</span>
          {(item.badge ?? -1) > 0 && (
            <span style={{ marginLeft: 'auto', background: role === 'manager' ? '#b85c52' : '#2c5a30', color: '#fff', borderRadius: '100px', fontSize: '10px', fontWeight: 700, padding: '2px 7px', minWidth: '18px', textAlign: 'center' }}>
              {item.badge}
            </span>
          )}
        </div>
      ))}

      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(122,100,70,0.08)' }}>
        <div style={{ padding: '10px 14px', borderRadius: '12px', background: roleBadge.bg, border: `1px solid ${roleBadge.border}`, fontSize: '12px', color: roleBadge.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {role === 'admin' ? <IconShield size={14} /> : role === 'manager' ? <IconChart size={14} /> : <IconLayers size={14} />}
          {roleBadge.label}
        </div>
      </div>
    </aside>
  )
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
      <div>
        <h1 className="serif-heading page-header-title" style={{ fontSize: '32px', color: '#2c2415', letterSpacing: '-0.5px', marginBottom: '8px' }}>{title}</h1>
        <p style={{ color: '#8a7a65', fontSize: '14px', lineHeight: 1.5 }}>{subtitle}</p>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

// ── WORKER ──────────────────────────────────────────────
function WorkerDashboard() {
  const [page, setPage] = useState('chat')
  const [showMore, setShowMore] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; text: string; citation?: string | null }>>([
    { role: 'ai', text: "Welcome. I have access to your full Employee Handbook and can answer any policy question with an exact page citation. What do you need to know?" },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [myQuestions, setMyQuestions] = useState<any[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [answers, setAnswers] = useState<Array<{ correct: boolean; selected: string }>>([])
  const [quizDone, setQuizDone] = useState(false)
  const [quizLoading, setQuizLoading] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const res = await fetch(`/api/my-questions?user_id=${user.id}`)
        const data = await res.json()
        setMyQuestions(data.questions ?? [])
        setQuestionsLoading(false)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    async function loadQuestions() {
      const res = await fetch('/api/questions')
      const data = await res.json()
      setQuestions(data.questions ?? [])
      setQuizLoading(false)
    }
    loadQuestions()
  }, [])

  async function sendChat() {
    if (!input.trim()) return
    const question = input
    setMessages(m => [...m, { role: 'user', text: question }])
    setInput('')
    setTyping(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, user_id: userId })
      })
      const { answer, citation } = await res.json()
      setMessages(m => [...m, { role: 'ai', text: answer, citation }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Something went wrong. Please try again.', citation: null }])
    } finally {
      setTyping(false)
    }
  }

  async function answerQuestion(selected: string) {
    const current = questions[quizIndex]
    const correct = selected === current.correct_option
    const newAnswers = [...answers, { correct, selected }]
    setAnswers(newAnswers)

    if (quizIndex + 1 >= questions.length) {
      setQuizDone(true)
      const totalCorrect = newAnswers.filter(a => a.correct).length
      const score = Math.round((totalCorrect / questions.length) * 100)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, question_id: 'daily-quiz', correct: totalCorrect === questions.length, score })
        })
      }
    } else {
      setTimeout(() => setQuizIndex(i => i + 1), 800)
    }
  }

  const currentQuestion = questions[quizIndex]
  const totalCorrect = answers.filter(a => a.correct).length
  const finalScore = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0

  const navItems = [
    { key: 'chat', label: 'Chat', icon: <IconChat size={17} /> },
    { key: 'quiz', label: 'Quiz', icon: <IconTarget size={17} /> },
    { key: 'questions', label: 'Questions', icon: <IconInbox size={17} />, badge: myQuestions.filter(q => q.resolved && q.manager_reply).length },
  ]

  const currentPageLabel = navItems.find(n => n.key === page)?.label ?? 'Policy Chat'

  return (
    <>
      <style>{GLASS_STYLE}</style>
      {showMore && (
        <MoreSheet
          items={navItems.slice(4)}
          page={page}
          setPage={setPage}
          onClose={() => setShowMore(false)}
        />
      )}
      <div className="app-layout">
        <Sidebar role="worker" page={page} setPage={setPage} navItems={navItems} />
        <MobileTopBar title={currentPageLabel} />

        <main className="main-content">

          {page === 'chat' && (
            <div className="fade-in">
              {!isMobile && <PageHeader title="Policy Chat" subtitle="Ask anything. Answers come straight from your handbook with page citations." />}
              <div className="glass-card chat-window" style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'calc(100dvh - 180px)' : '560px' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '18px' : '28px', display: 'flex', flexDirection: 'column', gap: '16px', WebkitOverflowScrolling: 'touch' }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                      <div className={`chat-avatar ${m.role === 'ai' ? 'chat-avatar-ai' : 'chat-avatar-user'}`}>
                        {m.role === 'ai' ? <IconLayers size={16} color="#fff" /> : <span className="chat-avatar-user-text">You</span>}
                      </div>
                      <div style={{ maxWidth: isMobile ? '82%' : '72%' }}>
                        <div className={m.role === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'} style={{ padding: isMobile ? '12px 14px' : '14px 18px', fontSize: '14px', lineHeight: 1.7, color: '#2c2415' }}>
                          {m.text}
                        </div>
                        {m.citation && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px', background: 'rgba(122,158,126,0.08)', border: '1px solid rgba(122,158,126,0.2)', borderRadius: '8px', padding: '4px 12px', fontSize: '11px', color: '#2c5a30', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                            <IconFile size={12} /> {m.citation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div className="chat-avatar chat-avatar-ai"><IconLayers size={16} color="#fff" /></div>
                      <div className="chat-bubble-ai" style={{ padding: '14px 18px', fontSize: '14px', color: '#b0a08c', display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ animation: 'pulse-dot 1.2s infinite 0s' }}>.</span>
                        <span style={{ animation: 'pulse-dot 1.2s infinite 0.2s' }}>.</span>
                        <span style={{ animation: 'pulse-dot 1.2s infinite 0.4s' }}>.</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ padding: isMobile ? '12px 14px' : '18px 22px', borderTop: '1px solid rgba(122,100,70,0.06)', display: 'flex', gap: '10px' }}>
                  <input
                    className="glass-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Ask a policy question..."
                    style={{ flex: 1 }}
                  />
                  <button className="glass-btn glass-btn-primary" onClick={sendChat} style={{ width: '50px', height: '50px', padding: 0, borderRadius: '14px', flexShrink: 0 }}>
                    <IconSend size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {page === 'quiz' && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h1 className="serif-heading page-header-title" style={{ fontSize: '28px', color: '#2c2415', letterSpacing: '-0.4px', marginBottom: '6px' }}>Daily Quiz</h1>
                  <p style={{ color: '#8a7a65', fontSize: '14px' }}>Keep sharp on company policy.</p>
                </div>
                {!quizDone && !quizLoading && (
                  <span className="badge badge-green" style={{ fontSize: '12px', padding: '6px 14px' }}>
                    {quizIndex + 1} / {questions.length}
                  </span>
                )}
              </div>

              {quizLoading && <div style={{ color: '#8a7a65', fontSize: '14px' }}>Loading questions...</div>}

              {!quizLoading && !quizDone && currentQuestion && (
                <div className="quiz-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                  <div className="glass-card" style={{ padding: isMobile ? '22px' : '32px' }}>
                    <div style={{ height: '4px', borderRadius: '99px', background: 'rgba(122,100,70,0.08)', marginBottom: '22px' }}>
                      <div style={{ height: '100%', width: `${(quizIndex / questions.length) * 100}%`, borderRadius: '99px', background: 'linear-gradient(90deg, rgba(122,158,126,0.7) 0%, rgba(122,158,126,0.9) 100%)', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: '10px', color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px', fontWeight: 700 }}>{currentQuestion.topic}</div>
                    <div className="serif-heading" style={{ fontSize: '18px', lineHeight: 1.6, marginBottom: '24px', color: '#2c2415' }}>{currentQuestion.question}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <button key={opt} className="quiz-option-btn" onClick={() => answerQuestion(opt)}>
                          <span style={{ fontWeight: 700, color: '#7a9e7e', marginRight: '10px', fontSize: '13px' }}>{opt}</span>
                          {currentQuestion[`option_${opt.toLowerCase()}`]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: isMobile ? '22px' : '32px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '20px' }}>Your Progress</div>
                    {answers.map((a, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px', alignItems: 'center' }}>
                        <span style={{ color: '#8a7a65' }}>Q{i + 1}</span>
                        <span className={`badge ${a.correct ? 'badge-green' : 'badge-red'}`}>
                          {a.correct ? <><IconCheck size={12} /> Correct</> : <><IconX size={12} /> Wrong</>}
                        </span>
                      </div>
                    ))}
                    {answers.length === 0 && <div style={{ color: '#b0a08c', fontSize: '13px' }}>No answers yet</div>}
                  </div>
                </div>
              )}

              {!quizLoading && quizDone && (
                <div className="glass-card" style={{ padding: isMobile ? '32px 24px' : '48px' }}>
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ marginBottom: '16px' }}>
                      {finalScore === 100 ? <IconAward size={48} color="#2c5a30" /> : finalScore >= 66 ? <IconCheck size={48} color="#5a8a5e" /> : <IconTarget size={48} color="#b8926c" />}
                    </div>
                    <div className="serif-heading" style={{ fontSize: isMobile ? '48px' : '56px', color: finalScore === 100 ? '#2c5a30' : finalScore >= 66 ? '#5a8a5e' : '#b8926c', marginBottom: '8px', letterSpacing: '-2px' }}>{finalScore}%</div>
                    <div style={{ fontSize: '15px', color: '#8a7a65', marginBottom: '28px' }}>{totalCorrect} of {questions.length} correct</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', maxWidth: '520px', margin: '0 auto 28px' }}>
                      {questions.map((q, i) => (
                        <div key={i} style={{ padding: '14px 18px', borderRadius: '16px', background: answers[i]?.correct ? 'rgba(90,138,94,0.06)' : 'rgba(184,92,82,0.05)', border: `1px solid ${answers[i]?.correct ? 'rgba(90,138,94,0.18)' : 'rgba(184,92,82,0.15)'}` }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: answers[i]?.correct ? '#2c5a30' : '#8a3a30', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {answers[i]?.correct ? <IconCheck size={13} /> : <IconX size={13} />}
                            {answers[i]?.correct ? 'Correct' : 'Incorrect'} · Q{i + 1}
                          </div>
                          <div style={{ fontSize: '13px', color: '#8a7a65', lineHeight: 1.5 }}>{q.explanation}</div>
                        </div>
                      ))}
                    </div>
                    <button className="glass-btn glass-btn-primary" onClick={() => { setQuizIndex(0); setAnswers([]); setQuizDone(false) }} style={{ padding: '15px 32px', fontSize: '15px' }}>
                      Retake Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {page === 'questions' && (
            <div className="fade-in">
              <PageHeader title="My Questions" subtitle="Questions the AI couldn't answer. Manager replies appear here." />
              <div className="glass-card" style={{ padding: isMobile ? '20px' : '28px' }}>
                {questionsLoading && <div style={{ color: '#8a7a65', fontSize: '14px' }}>Loading...</div>}
                {!questionsLoading && myQuestions.length === 0 && (
                  <div style={{ color: '#8a7a65', fontSize: '14px', padding: '8px 0' }}>No escalated questions yet.</div>
                )}
                {myQuestions.map(q => (
                  <div key={q.id} style={{ padding: '20px 0', borderBottom: '1px solid rgba(122,100,70,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#b0a08c', fontWeight: 500 }}>{new Date(q.created_at).toLocaleDateString()}</div>
                      <span className={`badge ${q.resolved ? 'badge-green' : 'badge-amber'}`}>
                        {q.resolved ? <><IconCheck size={11} /> Answered</> : <><IconClock size={11} /> Pending</>}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#2c2415', fontWeight: 500, marginBottom: '14px', padding: '12px 16px', background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)', borderRadius: '12px', fontStyle: 'italic', border: '1px solid rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                      "{q.question}"
                    </div>
                    {q.manager_reply ? (
                      <div style={{ padding: '14px 18px', borderRadius: '14px', background: 'rgba(90,138,94,0.06)', border: '1px solid rgba(90,138,94,0.18)' }}>
                        <div style={{ fontSize: '11px', color: '#2c5a30', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                          {q.manager_name ?? 'Manager'} replied {q.replied_at ? `· ${new Date(q.replied_at).toLocaleDateString()}` : ''}
                        </div>
                        <div style={{ fontSize: '14px', color: '#2c2415', lineHeight: 1.65 }}>{q.manager_reply}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#b0a08c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconClock size={13} /> Waiting for a manager to reply
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <MobileBottomNav items={navItems} page={page} setPage={setPage} onMorePress={() => setShowMore(true)} />
      </div>
    </>
  )
}

// ── MANAGER ──────────────────────────────────────────────
function ManagerDashboard() {
  const [page, setPage] = useState('snapshot')
  const [showMore, setShowMore] = useState(false)
  const [pulseData, setPulseData] = useState<any>(null)
  const [escalations, setEscalations] = useState<any[]>([])
  const [trending, setTrending] = useState<Array<{ term: string; count: number }>>([])
  const [searchName, setSearchName] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchFound, setSearchFound] = useState<number | null>(null)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replySending, setReplySending] = useState<Record<string, boolean>>({})
  const [replySent, setReplySent] = useState<Record<string, boolean>>({})
  const isMobile = useIsMobile()

  useEffect(() => {
    fetch('/api/manager').then(r => r.json()).then(d => setPulseData(d))
    fetch('/api/escalations').then(r => r.json()).then(d => setEscalations(d.escalations ?? []))
    fetch('/api/trending').then(r => r.json()).then(d => setTrending(d.topics ?? []))
  }, [])

  async function searchEmployee() {
    if (!searchName.trim()) return
    setSearchLoading(true)
    setSearchResults([])
    const res = await fetch(`/api/audit-search?name=${encodeURIComponent(searchName)}`)
    const data = await res.json()
    setSearchResults(data.results ?? [])
    setSearchFound(data.found ?? 0)
    setSearchLoading(false)
  }

  async function sendReply(escalationId: string) {
    const reply = replyText[escalationId]
    if (!reply?.trim()) return
    setReplySending(p => ({ ...p, [escalationId]: true }))
    await fetch('/api/escalations/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escalation_id: escalationId, reply, manager_name: 'Your Manager' })
    })
    setReplySent(p => ({ ...p, [escalationId]: true }))
    setEscalations(prev => prev.map(e => e.id === escalationId ? { ...e, resolved: true } : e))
    setReplySending(p => ({ ...p, [escalationId]: false }))
  }

  const maxCount = trending.length > 0 ? trending[0].count : 1

  const navItems = [
    { key: 'snapshot', label: 'Snapshot', icon: <IconChart size={17} /> },
    { key: 'inbox', label: 'Inbox', icon: <IconInbox size={17} />, badge: escalations.filter(e => !e.resolved).length },
    { key: 'trending', label: 'Trending', icon: <IconTrending size={17} /> },
    { key: 'search', label: 'Audit', icon: <IconSearch size={17} /> },
  ]

  const currentPageLabel = navItems.find(n => n.key === page)?.label ?? 'Manager'

  return (
    <>
      <style>{GLASS_STYLE}</style>
      {showMore && <MoreSheet items={navItems.slice(4)} page={page} setPage={setPage} onClose={() => setShowMore(false)} />}
      <div className="app-layout">
        <Sidebar role="manager" page={page} setPage={setPage} navItems={navItems} />
        <MobileTopBar title={currentPageLabel} />

        <main className="main-content">

          {page === 'snapshot' && (
            <div className="fade-in">
              <PageHeader title="Team Snapshot" subtitle="Today's knowledge check results for your team." />
              <div className="stats-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Completed', val: pulseData ? `${pulseData.completed}` : '--', sub: `of ${pulseData?.total ?? '--'} members`, color: '#2c5a30' },
                  { label: 'Avg Score', val: pulseData ? `${pulseData.avgScore}%` : '--', sub: 'today', color: '#2a4a7a' },
                  { label: 'Not Started', val: pulseData ? `${(pulseData.total ?? 0) - (pulseData.completed ?? 0)}` : '--', sub: 'need reminder', color: '#7a5020' },
                ].map(s => (
                  <div key={s.label} className="glass-card" style={{ padding: isMobile ? '20px' : '28px' }}>
                    <div className="stat-card-inner">
                      <div style={{ fontSize: '10px', color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '10px', fontWeight: 700 }}>{s.label}</div>
                      <div className="serif-heading" style={{ fontSize: isMobile ? '32px' : '42px', color: s.color, letterSpacing: '-1.5px', lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: '12px', color: '#8a7a65', marginTop: '6px' }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass-card" style={{ padding: isMobile ? '20px' : '28px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '18px' }}>Team Results</div>
                {(!pulseData?.team || pulseData.team.length === 0) && <div style={{ color: '#8a7a65', fontSize: '14px' }}>No team data yet.</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(pulseData?.team ?? []).map((row: any) => (
                    <div key={row.name} className="tag-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: row.completed ? 'rgba(90,138,94,0.12)' : 'rgba(184,92,82,0.08)', border: `1px solid ${row.completed ? 'rgba(90,138,94,0.25)' : 'rgba(184,92,82,0.15)'}`, flexShrink: 0 }}>
                        {row.completed ? <IconCheck size={14} color="#2c5a30" /> : <IconClock size={14} color="#b85c52" />}
                      </div>
                      <div style={{ flex: 1, minWidth: '100px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#2c2415' }}>{row.name}</div>
                        <div style={{ fontSize: '12px', color: '#8a7a65', marginTop: '2px' }}>
                          {row.completed ? `Score: ${row.score}%` : 'Not done yet'}
                        </div>
                      </div>
                      <span className={`badge ${row.completed ? 'badge-green' : 'badge-red'}`}>
                        {row.completed ? <><IconCheck size={11} /> Done</> : <><IconAlertTriangle size={11} /> Missing</>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {page === 'inbox' && (
            <div className="fade-in">
              <PageHeader title="Needs Answer" subtitle="Reply and it goes straight to the employee." />
              <div className="glass-card" style={{ padding: isMobile ? '20px' : '28px' }}>
                {escalations.length === 0 && <div style={{ color: '#8a7a65', fontSize: '14px', padding: '12px 0' }}>No open questions. All clear.</div>}
                {escalations.map(e => (
                  <div key={e.id} style={{ padding: isMobile ? '18px 0' : '22px 0', borderBottom: '1px solid rgba(122,100,70,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#2c2415' }}>{e.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#b0a08c', fontWeight: 500 }}>{new Date(e.time).toLocaleDateString()}</div>
                        <span className={`badge ${e.resolved ? 'badge-green' : 'badge-red'}`}>
                          {e.resolved ? 'Resolved' : 'Open'}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#6a5a45', marginBottom: '16px', padding: '12px 16px', background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)', borderRadius: '12px', fontStyle: 'italic', border: '1px solid rgba(255,255,255,0.5)', lineHeight: 1.6 }}>"{e.question}"</div>
                    {!e.resolved && !replySent[e.id] && (
                      <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
                        <input
                          className="glass-input"
                          value={replyText[e.id] ?? ''}
                          onChange={ev => setReplyText(p => ({ ...p, [e.id]: ev.target.value }))}
                          onKeyDown={ev => ev.key === 'Enter' && sendReply(e.id)}
                          placeholder="Type your answer..."
                          style={{ flex: 1 }}
                        />
                        <button className="glass-btn glass-btn-primary" onClick={() => sendReply(e.id)} disabled={replySending[e.id]} style={{ padding: '13px 20px', whiteSpace: 'nowrap' }}>
                          {replySending[e.id] ? 'Sending...' : <><IconSend size={15} /> Reply</>}
                        </button>
                      </div>
                    )}
                    {replySent[e.id] && (
                      <div style={{ fontSize: '13px', color: '#2c5a30', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconCheck size={14} /> Reply sent
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'trending' && (
            <div className="fade-in">
              <PageHeader title="Trending Topics" subtitle="What your team asks most over the last 30 days." />
              <div className="glass-card" style={{ padding: isMobile ? '20px' : '32px' }}>
                {trending.length === 0 && <div style={{ color: '#8a7a65', fontSize: '14px' }}>No data yet.</div>}
                {trending.map((t, i) => (
                  <div key={t.term} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '12px', color: '#b0a08c', minWidth: '20px', textAlign: 'right', fontWeight: 700 }}>#{i + 1}</div>
                    <div className="trending-label" style={{ fontSize: '14px', fontWeight: 600, minWidth: '130px', textTransform: 'capitalize', color: '#2c2415' }}>{t.term}</div>
                    <div style={{ flex: 1, minWidth: '60px', height: '6px', borderRadius: '99px', background: 'rgba(122,100,70,0.06)' }}>
                      <div style={{ height: '100%', width: `${Math.round((t.count / maxCount) * 100)}%`, borderRadius: '99px', background: i === 0 ? 'linear-gradient(90deg, rgba(184,92,82,0.7) 0%, rgba(184,92,82,0.9) 100%)' : i <= 2 ? 'linear-gradient(90deg, rgba(182,142,108,0.6) 0%, rgba(182,142,108,0.85) 100%)' : 'linear-gradient(90deg, rgba(122,158,126,0.5) 0%, rgba(122,158,126,0.75) 100%)', transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ fontSize: '13px', color: '#8a7a65', minWidth: '60px', textAlign: 'right', fontWeight: 500 }}>{t.count}×</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'search' && (
            <div className="fade-in">
              <PageHeader title="Audit Search" subtitle="Search any employee's full question and quiz history." />
              <div className="search-row" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input className="glass-input" value={searchName} onChange={e => setSearchName(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchEmployee()} placeholder="Enter employee name..." style={{ flex: 1 }} />
                <button className="glass-btn glass-btn-primary" onClick={searchEmployee} style={{ padding: '13px 24px', whiteSpace: 'nowrap' }}>
                  <IconSearch size={16} /> Search
                </button>
              </div>
              {searchLoading && <div style={{ color: '#8a7a65', fontSize: '14px' }}>Searching...</div>}
              {!searchLoading && searchFound !== null && (
                <div style={{ fontSize: '12px', color: '#b0a08c', marginBottom: '14px', fontWeight: 500 }}>
                  {searchFound === 0 ? 'No employee found with that name.' : `Found ${searchFound} employee${searchFound > 1 ? 's' : ''}`}
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="glass-card" style={{ padding: isMobile ? '16px' : '24px' }}>
                  {searchResults.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(122,100,70,0.05)', flexWrap: 'wrap' }}>
                      <span className={`badge ${r.type === 'chat' ? 'badge-blue' : 'badge-green'}`}>
                        {r.type === 'chat' ? <><IconChat size={11} /> Chat</> : <><IconTarget size={11} /> Quiz</>}
                      </span>
                      <div style={{ flex: 1, minWidth: '120px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '3px', color: '#2c2415' }}>
                          {r.type === 'chat' ? r.question : `Quiz Score: ${r.score}%`}
                        </div>
                        {r.type === 'chat' && r.escalated && (
                          <span style={{ fontSize: '10px', color: '#8a3a30', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <IconAlertTriangle size={10} /> Escalated
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#b0a08c', fontWeight: 500 }}>
                        {new Date(r.time).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        <MobileBottomNav items={navItems} page={page} setPage={setPage} onMorePress={() => setShowMore(true)} />
      </div>
    </>
  )
}

// ── ADMIN ──────────────────────────────────────────────
function AdminDashboard() {
  const [page, setPage] = useState('dashboard')
  const [showMore, setShowMore] = useState(false)
  const [auditLogs, setAuditLogs] = useState<Array<{ time: string; user: string; action: string }>>([])
  const [adminStats, setAdminStats] = useState<{ completion: number; atRiskCount: number; atRisk: Array<{ name: string; score: string; risk: string }> } | null>(null)
  const [gaps, setGaps] = useState<Array<{ term: string; count: number; docMentions: number }>>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    fetch('/api/audit').then(r => r.json()).then(d => setAuditLogs(d.logs ?? []))
    fetch('/api/admin-stats').then(r => r.json()).then(d => setAdminStats(d))
    fetch('/api/gap-analysis').then(r => r.json()).then(d => setGaps(d.gaps ?? []))
  }, [])

  async function handleUpload(file: File) {
    if (!file || file.type !== 'application/pdf') { setUploadStatus('Please upload a PDF file.'); return }
    setUploading(true)
    setUploadStatus('Uploading and processing...')
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.success) setUploadStatus(`Uploaded: ${file.name} – ${data.chunks} sections indexed`)
      else setUploadStatus(`Error: ${data.error}`)
    } catch {
      setUploadStatus('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function exportCSV() { window.open('/api/export-csv', '_blank') }

  const navItems = [
    { key: 'dashboard', label: 'Overview', icon: <IconShield size={17} /> },
    { key: 'knowledge', label: 'Knowledge', icon: <IconFolder size={17} /> },
    { key: 'gaps', label: 'Gaps', icon: <IconMicroscope size={17} /> },
    { key: 'logs', label: 'Logs', icon: <IconList size={17} /> },
    { key: 'invite', label: 'Users', icon: <IconUsers size={17} /> },
  ]

  const currentPageLabel = navItems.find(n => n.key === page)?.label ?? 'Admin'

  return (
    <>
      <style>{GLASS_STYLE}</style>
      {showMore && <MoreSheet items={navItems.slice(4)} page={page} setPage={setPage} onClose={() => setShowMore(false)} />}
      <div className="app-layout">
        <Sidebar role="admin" page={page} setPage={setPage} navItems={navItems} />
        <MobileTopBar title={currentPageLabel} />

        <main className="main-content">

          {page === 'dashboard' && (
            <div className="fade-in">
              <PageHeader title="Compliance Overview" subtitle="Company-wide compliance health at a glance." />
              <div className="stats-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Overall Completion', val: adminStats ? `${adminStats.completion}%` : '--', sub: 'avg quiz score', color: '#2c5a30' },
                  { label: 'At Risk', val: adminStats ? `${adminStats.atRiskCount}` : '--', sub: 'below 60%', color: '#8a3a30' },
                ].map(s => (
                  <div key={s.label} className="glass-card" style={{ padding: isMobile ? '22px' : '32px' }}>
                    <div className="stat-card-inner">
                      <div style={{ fontSize: '10px', color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '10px', fontWeight: 700 }}>{s.label}</div>
                      <div className="serif-heading" style={{ fontSize: isMobile ? '38px' : '50px', color: s.color, letterSpacing: '-2px', lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: '12px', color: '#8a7a65', marginTop: '8px' }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass-card" style={{ padding: isMobile ? '20px' : '28px', overflowX: 'auto' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '18px' }}>Individual Scores</div>
                {!adminStats || adminStats.atRisk.length === 0 ? (
                  <div style={{ color: '#8a7a65', fontSize: '14px' }}>No at-risk employees.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '280px' }}>
                    <thead>
                      <tr>
                        {['Name', 'Score', 'Risk'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#b0a08c', borderBottom: '1px solid rgba(122,100,70,0.08)', letterSpacing: '1px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {adminStats.atRisk.map(r => (
                        <tr key={r.name}>
                          <td style={{ padding: '12px', color: '#2c2415', borderBottom: '1px solid rgba(122,100,70,0.04)', fontWeight: 500 }}>{r.name}</td>
                          <td style={{ padding: '12px', color: r.risk === 'Medium' ? '#7a5020' : '#8a3a30', borderBottom: '1px solid rgba(122,100,70,0.04)', fontWeight: 600 }}>{r.score}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid rgba(122,100,70,0.04)' }}>
                            <span className={`badge ${r.risk === 'Medium' ? 'badge-amber' : 'badge-red'}`}>{r.risk}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {page === 'knowledge' && (
            <div className="fade-in">
              <PageHeader title="Knowledge Base" subtitle="Upload handbooks and policy docs. The AI reads them instantly." />
              <div
                className="glass-card"
                style={{ border: uploading ? '2px dashed rgba(122,158,126,0.5)' : '2px dashed rgba(122,100,70,0.15)', borderRadius: '24px', padding: isMobile ? '40px 24px' : '64px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s ease', background: uploading ? 'rgba(122,158,126,0.05)' : undefined }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f) }}
              >
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
                <div style={{ marginBottom: '16px' }}><IconUpload size={40} color={uploading ? '#7a9e7e' : '#b0a08c'} /></div>
                <div className="serif-heading" style={{ fontSize: '18px', marginBottom: '10px', color: '#2c2415' }}>
                  {uploading ? 'Processing...' : isMobile ? 'Tap to upload PDF' : 'Drop PDF here or click to upload'}
                </div>
                <div style={{ fontSize: '13px', color: '#8a7a65', lineHeight: 1.5 }}>Employee handbook, safety manual, policy updates</div>
                {uploadStatus && (
                  <div style={{ marginTop: '20px', padding: '12px 20px', borderRadius: '14px', background: uploadStatus.startsWith('Uploaded') ? 'rgba(90,138,94,0.08)' : uploadStatus.startsWith('Error') ? 'rgba(184,92,82,0.08)' : 'rgba(122,158,126,0.06)', border: `1px solid ${uploadStatus.startsWith('Uploaded') ? 'rgba(90,138,94,0.2)' : uploadStatus.startsWith('Error') ? 'rgba(184,92,82,0.2)' : 'rgba(122,158,126,0.2)'}`, fontSize: '13px', color: uploadStatus.startsWith('Uploaded') ? '#2c5a30' : uploadStatus.startsWith('Error') ? '#8a3a30' : '#2c5a30', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    {uploadStatus.startsWith('Uploaded') ? <IconCheck size={14} /> : uploadStatus.startsWith('Error') ? <IconX size={14} /> : null}
                    {uploadStatus}
                  </div>
                )}
              </div>
            </div>
          )}

          {page === 'gaps' && (
            <div className="fade-in">
              <PageHeader title="Gap Analysis" subtitle="Topics your team asks about but your docs barely cover." />
              <div className="glass-card" style={{ padding: isMobile ? '20px' : '28px' }}>
                {gaps.length === 0 && <div style={{ color: '#8a7a65', fontSize: '14px' }}>Not enough data yet.</div>}
                {gaps.map((g, i) => (
                  <div key={g.term} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '16px', background: i === 0 ? 'rgba(184,92,82,0.04)' : 'rgba(182,142,108,0.04)', border: `1px solid ${i === 0 ? 'rgba(184,92,82,0.15)' : 'rgba(182,142,108,0.12)'}`, marginBottom: '10px', flexWrap: 'wrap' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? 'rgba(184,92,82,0.08)' : 'rgba(182,142,108,0.08)', border: `1px solid ${i === 0 ? 'rgba(184,92,82,0.2)' : 'rgba(182,142,108,0.2)'}`, flexShrink: 0 }}>
                      <IconAlertTriangle size={15} color={i === 0 ? '#8a3a30' : '#7a5020'} />
                    </div>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, textTransform: 'capitalize', marginBottom: '4px', color: '#2c2415' }}>{g.term}</div>
                      <div style={{ fontSize: '12px', color: '#8a7a65' }}>
                        Asked {g.count}× · {g.docMentions} mention{g.docMentions !== 1 ? 's' : ''} in docs
                      </div>
                    </div>
                    <span className={`badge ${i === 0 ? 'badge-red' : 'badge-amber'}`}>
                      {i === 0 ? 'High Gap' : 'Gap'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'logs' && (
            <div className="fade-in">
              <PageHeader
                title="Audit Log"
                subtitle="Every question, answer, and quiz across the company."
                action={
                  <button className="glass-btn glass-btn-primary" onClick={exportCSV} style={{ padding: '11px 20px' }}>
                    <IconDownload size={15} /> Export CSV
                  </button>
                }
              />
              <div className="glass-card" style={{ padding: isMobile ? '18px' : '28px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '18px' }}>Activity</div>
                {auditLogs.length === 0 && <div style={{ color: '#8a7a65', fontSize: '14px' }}>No activity yet.</div>}
                {auditLogs.map((log, i) => (
                  <div key={i} className="audit-log-row" style={{ display: 'flex', alignItems: 'baseline', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(122,100,70,0.05)', fontSize: '13px', flexWrap: 'wrap' }}>
                    <div className="audit-log-time" style={{ fontSize: '11px', color: '#b0a08c', minWidth: '140px', fontWeight: 500 }}>{new Date(log.time).toLocaleString()}</div>
                    <div style={{ color: '#2c5a30', fontWeight: 600, minWidth: '120px' }}>{log.user}</div>
                    <div style={{ color: '#8a7a65', flex: 1 }}>{log.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'invite' && (
            <div className="fade-in">
              <PageHeader title="User Management" subtitle="Invite employees individually or upload a CSV list." />
              <div className="invite-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px' }}>Individual Invite</div>
                  <InviteForm />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px' }}>Bulk Upload</div>
                  <CsvUpload />
                </div>
              </div>
            </div>
          )}
        </main>

        <MobileBottomNav items={navItems} page={page} setPage={setPage} onMorePress={() => setShowMore(true)} />
      </div>
    </>
  )
}

function CsvUpload() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleCsv(file: File) {
    if (!file) return
    setLoading(true)
    setStatus('Processing...')
    const text = await file.text()
    const lines = text.trim().split('\n').slice(1)
    let sent = 0, failed = 0
    for (const line of lines) {
      const parts = line.split(',')
      const email = parts[0]?.trim().replace(/"/g, '')
      const role = parts[1]?.trim().replace(/"/g, '') || 'worker'
      if (!email || !email.includes('@')) continue
      try {
        const res = await fetch('/api/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) })
        const data = await res.json()
        if (data.success) sent++; else failed++
      } catch { failed++ }
    }
    setStatus(`Done – ${sent} invites sent${failed > 0 ? `, ${failed} failed` : ''}`)
    setLoading(false)
  }

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ fontSize: '13px', color: '#8a7a65', marginBottom: '18px', lineHeight: 1.65 }}>
        CSV format: <code style={{ background: 'rgba(122,100,70,0.06)', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', color: '#2c2415', fontWeight: 600, border: '1px solid rgba(122,100,70,0.1)' }}>email,role</code><br />
        Roles: worker, manager, admin
      </div>
      <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleCsv(f) }} />
      <button className="glass-btn" onClick={() => fileRef.current?.click()} disabled={loading} style={{ width: '100%', padding: '15px', touchAction: 'manipulation' }}>
        <IconUpload size={16} /> {loading ? 'Sending invites...' : 'Upload CSV'}
      </button>
      {status && (
        <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '14px', background: status.includes('failed') ? 'rgba(182,142,108,0.08)' : 'rgba(90,138,94,0.06)', border: `1px solid ${status.includes('failed') ? 'rgba(182,142,108,0.2)' : 'rgba(90,138,94,0.18)'}`, fontSize: '13px', color: status.includes('failed') ? '#7a5020' : '#2c5a30', fontWeight: 600 }}>
          {status}
        </div>
      )}
    </div>
  )
}

function InviteForm() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('worker')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendInvite() {
    if (!email.trim()) return
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch('/api/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) })
      const data = await res.json()
      if (data.success) { setStatus(`Invite sent to ${email}`); setEmail('') }
      else setStatus(`Error: ${data.error}`)
    } catch {
      setStatus('Failed to send invite.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '10px', color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', fontWeight: 700 }}>Email</label>
        <input className="glass-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="employee@company.com" style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '10px', color: '#b0a08c', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', fontWeight: 700 }}>Role</label>
        <select className="glass-input" value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', cursor: 'pointer' }}>
          <option value="worker">Worker</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button className="glass-btn glass-btn-primary" onClick={sendInvite} disabled={loading} style={{ width: '100%', padding: '16px', touchAction: 'manipulation' }}>
        {loading ? 'Sending...' : <><IconSend size={15} /> Send Invite</>}
      </button>
      {status && (
        <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '14px', background: status.includes('Error') ? 'rgba(184,92,82,0.06)' : 'rgba(90,138,94,0.06)', border: `1px solid ${status.includes('Error') ? 'rgba(184,92,82,0.18)' : 'rgba(90,138,94,0.18)'}`, fontSize: '13px', color: status.includes('Error') ? '#8a3a30' : '#2c5a30', fontWeight: 600 }}>
          {status}
        </div>
      )}
    </div>
  )
}