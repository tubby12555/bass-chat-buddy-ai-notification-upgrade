
import { cn } from "@/lib/utils";

interface BassLogoProps {
  className?: string;
}

const BassLogo = ({ className }: BassLogoProps) => {
  return (
    <div className={cn("pixel-border p-1 bg-chat-sidebar", className)}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Pixel Art Bass Fish */}
        <rect x="8" y="12" width="4" height="4" fill="#8B5CF6" />
        <rect x="12" y="8" width="8" height="4" fill="#8B5CF6" />
        <rect x="20" y="12" width="4" height="4" fill="#8B5CF6" />
        <rect x="4" y="16" width="4" height="4" fill="#8B5CF6" />
        <rect x="8" y="16" width="16" height="4" fill="#8B5CF6" />
        <rect x="24" y="16" width="4" height="4" fill="#8B5CF6" />
        <rect x="8" y="20" width="16" height="4" fill="#8B5CF6" />
        <rect x="20" y="16" width="4" height="4" fill="#1EAEDB" />
        <rect x="16" y="12" width="4" height="4" fill="#8B5CF6" />
        <rect x="12" y="12" width="4" height="4" fill="#8B5CF6" />
        {/* Eye */}
        <rect x="16" y="12" width="4" height="4" fill="white" />
        <rect x="18" y="12" width="2" height="2" fill="black" />
        {/* Fin */}
        <rect x="12" y="20" width="4" height="4" fill="#1EAEDB" />
      </svg>
    </div>
  );
};

export default BassLogo;
