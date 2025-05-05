
import React from "react";
import { Settings, User } from "lucide-react";

interface SettingsSectionProps {
  onToolClick: (tool: string) => void;
}

const SettingsSection = ({ onToolClick }: SettingsSectionProps) => {
  return (
    <div className="border-t border-chat-assistant mt-2">
      <div className="px-4 py-2 text-white text-opacity-70 font-semibold">
        Settings
      </div>
      
      {/* Settings Item */}
      <div 
        className="flex items-center px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
        onClick={() => onToolClick("settings")}
      >
        <Settings size={16} className="mr-2" />
        <span>Settings</span>
      </div>
      
      {/* Profile Item */}
      <div 
        className="flex items-center px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
        onClick={() => onToolClick("profile")}
      >
        <User size={16} className="mr-2" />
        <span>Profile</span>
      </div>
    </div>
  );
};

export default SettingsSection;
