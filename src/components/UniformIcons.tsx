import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export const VestIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L8 4V8L4 10V20H9V14H15V20H20V10L16 8V4L12 2Z" />
    <path d="M12 2V8" />
    <circle cx="7" cy="17" r="0.5" fill="currentColor" />
    <circle cx="7" cy="14.5" r="0.5" fill="currentColor" />
  </svg>
);

export const PantsIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2H18V8L15 22H13L12 12L11 22H9L6 8V2Z" />
    <path d="M6 6H18" />
  </svg>
);

export const MedicalScrubsIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 2H16L18 6V14H14V20H10V14H6V6L8 2Z" />
    <path d="M10 6H14" />
    <path d="M12 4V8" />
    <path d="M4 6L6 6" />
    <path d="M18 6L20 6" />
  </svg>
);

export const DefaultClothingIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 2L4 6L7 8V20H17V8L20 6L16 2H8Z" />
    <path d="M8 2C8 4 10 6 12 6C14 6 16 4 16 2" />
  </svg>
);

const KEYWORD_MAP: [string[], React.FC<IconProps>][] = [
  [["gilet", "vest", "veste"], VestIcon],
  [["pantalon", "pant", "jean"], PantsIcon],
  [["pyjama", "médical", "medical", "scrub", "blouse"], MedicalScrubsIcon],
];

export function getArticleIcon(articleName: string): React.FC<IconProps> {
  const lower = articleName.toLowerCase();
  for (const [keywords, Icon] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return Icon;
    }
  }
  return DefaultClothingIcon;
}
