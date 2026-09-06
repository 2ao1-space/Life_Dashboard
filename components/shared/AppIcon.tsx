import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckSquare,
  CircleDollarSign,
  File,
  FileImage,
  Folder,
  HandHeart,
  Home,
  Landmark,
  Meh,
  NotebookPen,
  Palette,
  Pin,
  Receipt,
  ScanFace,
  Settings,
  Smile,
  Smartphone,
  SmilePlus,
  Sparkles,
  TabletSmartphone,
  TrendingDown,
  TrendingUp,
  Upload,
  WifiOff,
  type LucideIcon,
  WalletCards,
  Plus,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  finance: CircleDollarSign,
  home: Home,
  prayer: Landmark,
  adhkar: BookOpen,
  habits: CheckSquare,
  notes: NotebookPen,
  documents: Folder,
  analytics: BarChart3,
  "account-cash": WalletCards,
  "account-bank": Landmark,
  "account-phone": Smartphone,
  "account-card": WalletCards,
  "account-atm": Landmark,
  file: Folder,
  "file-image": FileImage,
  "file-pdf": File,
  dua: HandHeart,
  debt: HandHeart,
  receipt: Receipt,
  salary: BriefcaseBusiness,
  pin: Pin,
  drawing: Palette,
  offline: WifiOff,
  controls: Settings,
  touch: ScanFace,
  navigate: TrendingUp,
  "mood-1": SmilePlus,
  "mood-2": SmilePlus,
  "mood-3": Meh,
  "mood-4": Smile,
  "mood-5": SmilePlus,
  upload: Upload,
  income: TrendingUp,
  expense: TrendingDown,
  transfer: TabletSmartphone,
  "💰": CircleDollarSign,
  "🕌": Landmark,
  "📿": BookOpen,
  "✅": CheckSquare,
  "📝": NotebookPen,
  "📁": Folder,
  "📊": BarChart3,
  "💵": WalletCards,
  "🏦": Landmark,
  "📱": Smartphone,
  "💳": WalletCards,
  "🏧": Landmark,
  "🖼️": FileImage,
  "📄": File,
  "🤲": HandHeart,
  "🤝": HandHeart,
  "🧾": Receipt,
  "💼": BriefcaseBusiness,
  "📌": Pin,
  "✏️": Palette,
  "📡": WifiOff,
  "🎛️": Settings,
  "👆": ScanFace,
  "👉": TrendingUp,
  "😢": SmilePlus,
  "🙁": SmilePlus,
  "😐": Meh,
  "🙂": Smile,
  "😄": SmilePlus,
  "↓": TrendingDown,
  "↑": TrendingUp,
  "↔": TabletSmartphone,
  "＋": Plus,
  "📷": Upload,
};

interface AppIconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export default function AppIcon({
  name,
  className,
  size = 20,
  strokeWidth = 1.8,
}: AppIconProps) {
  const Icon = ICONS[name.trim()] ?? Sparkles;
  return (
    <Icon
      aria-hidden="true"
      className={className}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}
