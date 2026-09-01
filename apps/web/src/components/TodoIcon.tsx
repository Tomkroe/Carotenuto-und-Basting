import {
  AlertTriangle,
  Car,
  CalendarClock,
  CircleDot,
  ClipboardList,
  Droplet,
  FileText,
  Flame,
  Hammer,
  Home,
  KeyRound,
  Lightbulb,
  Mail,
  Package,
  PaintRoller,
  Phone,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  UserRound,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { TodoIconName } from "@maklerprogram/types";

const ICON_MAP: Record<TodoIconName, LucideIcon> = {
  Wrench,
  Phone,
  Mail,
  FileText,
  CalendarClock,
  KeyRound,
  Droplet,
  Zap,
  Flame,
  Trash2,
  Car,
  ShieldCheck,
  Home,
  UserRound,
  Package,
  AlertTriangle,
  ClipboardList,
  Hammer,
  Sparkles,
  Truck,
  Lightbulb,
  PaintRoller,
  CircleDot,
};

export function TodoIcon({ icon, size = 15, className }: { icon: TodoIconName | null; size?: number; className?: string }) {
  const Icon = (icon && ICON_MAP[icon]) || CircleDot;
  return <Icon size={size} className={className} />;
}
