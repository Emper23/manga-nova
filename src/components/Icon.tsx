import type { JSX } from "react";

const PATHS: Record<string, JSX.Element> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5C10 4.8 7.4 4.2 4 4.6V18c3.4-.4 6 .2 8 1.9 2-1.7 4.6-2.3 8-1.9V4.6c-3.4-.4-6 .2-8 1.9Z" />
      <path d="M12 6.5v13.4" />
    </>
  ),
  tags: (
    <>
      <path d="M2.5 12.5 12 3h8v8l-9.5 9.5a2 2 0 0 1-2.8 0l-4.2-4.2a2 2 0 0 1 0-2.8Z" />
      <circle cx="16" cy="8" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  flame: (
    <path d="M12 22c4.4 0 7-2.9 7-6.7 0-3-1.7-5.2-3.4-7.1C14.2 6.6 12.9 4.9 13 2c-2.7 1.6-4 4.3-4 6.3 0 .9.3 1.6.5 2.2C9 9.6 8.3 8.8 8 7.6c-2.4 2-3.5 4.4-3.5 7C4.5 19.1 7.4 22 12 22Z" />
  ),
  bookmark: (
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z" />
  ),
  bookmarkFilled: (
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z" fill="currentColor" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.5-4.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 13.5A8.5 8.5 0 0 1 10.5 3a8.5 8.5 0 1 0 10.5 10.5Z" />,
  star: (
    <path d="m12 2.5 2.9 5.9 6.6 1-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.5 9.4l6.6-1L12 2.5Z" />
  ),
  starFilled: (
    <path
      d="m12 2.5 2.9 5.9 6.6 1-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.5 9.4l6.6-1L12 2.5Z"
      fill="currentColor"
    />
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  play: <path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" stroke="none" />,
  chevronLeft: <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  chevronRight: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  chevronDown: <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />,
  chevronUp: <path d="m5.5 14.5 6.5-6.5 6.5 6.5" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M4.3 6.2l2.6 1.5M17.1 16.3l2.6 1.5M2.5 12h3M18.5 12h3M4.3 17.8l2.6-1.5M17.1 7.7l2.6-1.5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrowUp: <path d="M12 20V4M5.5 10.5 12 4l6.5 6.5" />,
  arrowLeft: <path d="M20 12H4M10.5 5.5 4 12l6.5 6.5" />,
  fullscreen: (
    <>
      <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" />
      <path d="m9 9-6 6M15 9l6 6M9 15l-6-6M15 15l6-6" opacity="0" />
    </>
  ),
  compress: (
    <>
      <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
    </>
  ),
  heart: <path d="M12 20.5S3.5 15 3.5 9.2A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.5 2.7C20.5 15 12 20.5 12 20.5Z" />,
  heartFilled: (
    <path
      d="M12 20.5S3.5 15 3.5 9.2A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.5 2.7C20.5 15 12 20.5 12 20.5Z"
      fill="currentColor"
    />
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  filter: <path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z" />,
  check: <path d="m4.5 12.5 5 5L19.5 6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6.5 7l1 14h9l1-14" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  bookOpen: (
    <>
      <path d="M12 6.5C10 4.8 7.4 4.2 4 4.6V18c3.4-.4 6 .2 8 1.9 2-1.7 4.6-2.3 8-1.9V4.6c-3.4-.4-6 .2-8 1.9Z" />
      <path d="M12 6.5v13.4" />
      <path d="M4 9.5c3.4-.4 6 .2 8 1.9" opacity="0" />
    </>
  ),
  history: (
    <>
      <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6" />
      <path d="M4 4v4.6h4.6M12 8v4.2l2.8 1.7" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
      <path d="M12 14v3M8.5 21h7M10 17h4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.3l-1.8-5.7L4.5 10.8 10.2 9 12 3.5Z" />
      <path d="M19 16.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
    </>
  ),
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" stroke="none" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" fill="currentColor" stroke="none" />
    </>
  ),
  wand: (
    <>
      <path d="m5 19 9-9M14.5 4.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" />
      <path d="m17 8 3.5-3.5M20.5 4.5l.7 1.4-1.4.7" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14.5s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9.5h.01M15 9.5h.01" />
    </>
  ),
  portal: (
    <>
      <circle cx="12" cy="12" r="8" strokeDasharray="3.5 2.5" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  mask: (
    <>
      <path d="M12 3c3 2 6 2.5 9 2v11c0 2-4 4.5-9 4.5S3 18 3 16V5c3 .5 6 0 9-2Z" />
      <circle cx="9" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <path d="M9 14c.5 1 2 1.7 3 1.7s2.5-.7 3-1.7" />
    </>
  ),
  ghost: (
    <>
      <path d="M5 21V9a7 7 0 0 1 14 0v12l-2.5-2-2.5 2-2.5-2L9 21l-2.5-2L5 21Z" />
      <circle cx="9.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  magnify: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.5-4.5" />
      <path d="M8.5 11h5M11 8.5v5" />
    </>
  ),
  grad: (
    <>
      <path d="M3 9.5 12 4.5l9 5-9 5-9-5Z" />
      <path d="M7 12v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4M21 9.5V16" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3c3 1.5 5.5 4.5 6 9l-3 4h-6l-3-4c.5-4.5 3-7.5 6-9Z" />
      <circle cx="12" cy="10" r="2" />
      <path d="M9 16.5 7.5 21l4.5-2.5L16.5 21 15 16.5" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v12H4V8Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" stroke="none" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
    </>
  ),
  logOut: (
    <>
      <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
      <path d="M10 12h10M16 8l4 4-4 4" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L20 8a2.1 2.1 0 0 0-3-3L5 17l-1 3Z" />
      <path d="m14.5 6.5 3 3" />
    </>
  ),
  fire: <path d="M12 22c4.4 0 7-2.9 7-6.7 0-3-1.7-5.2-3.4-7.1C14.2 6.6 12.9 4.9 13 2c-2.7 1.6-4 4.3-4 6.3 0 .9.3 1.6.5 2.2C9 9.6 8.3 8.8 8 7.6c-2.4 2-3.5 4.4-3.5 7C4.5 19.1 7.4 22 12 22Z" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-.9 2-2 0-.6-.3-1-.6-1.4-.3-.4-.6-.8-.6-1.4 0-1.1.9-2 2-2H17a4.5 4.5 0 0 0 4.5-4.5C21.5 6.3 17.2 3 12 3Z" />
      <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19 6v5.5c0 4.6-2.9 7.8-7 9.5-4.1-1.7-7-4.9-7-9.5V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  externalLink: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, className, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
