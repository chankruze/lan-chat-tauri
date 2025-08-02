import {
  RiAppleFill,
  RiAndroidFill,
  RiUbuntuFill,
  RiWindowsFill,
  RiInstanceFill,
} from "@remixicon/react";

export const platformIcon = (platform?: string) => {
  switch ((platform || "").toLowerCase().replace(/\s/g, "")) {
    case "windows":
      return <RiWindowsFill className="w-4 h-4 text-blue-600" />;
    case "macos":
      return <RiAppleFill className="w-4 h-4 text-neutral-800" />;
    case "linux":
      return <RiUbuntuFill className="w-4 h-4 text-orange-600" />;
    case "android":
      return <RiAndroidFill className="w-4 h-4 text-green-600" />;
    default:
      return <RiInstanceFill className="w-4 h-4" />;
  }
};
