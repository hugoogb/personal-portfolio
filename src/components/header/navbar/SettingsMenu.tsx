import type { FC, ComponentType } from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { ColorContext } from "@/contexts/color.context";
import { IconSettings, IconRotate, IconCheck } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { DEFAULT_COLOR, PRESET_COLORS } from "@/constants/colors.constants";

type HexColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
};

type HexColorInputProps = {
  color: string;
  onChange: (color: string) => void;
  prefixed?: boolean;
  className?: string;
  placeholder?: string;
};

export const SettingsMenu: FC = () => {
  const { color, setColor } = useContext(ColorContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const [ColorPickerComponents, setColorPickerComponents] = useState<{
    Picker: ComponentType<HexColorPickerProps>;
    Input: ComponentType<HexColorInputProps>;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showCustom && !ColorPickerComponents) {
      import("react-colorful").then((mod) => {
        setColorPickerComponents({
          Picker: mod.HexColorPicker as ComponentType<HexColorPickerProps>,
          Input: mod.HexColorInput as ComponentType<HexColorInputProps>,
        });
      });
    }
  }, [showCustom, ColorPickerComponents]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleReset = () => {
    setColor(DEFAULT_COLOR);
    setShowCustom(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        className="p-2 rounded-full hover:bg-muted/10 transition-colors cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Theme settings"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <IconSettings size={20} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 mt-4 w-64 p-5 bg-card border border-border rounded-3xl shadow-2xl z-50 origin-top md:origin-top-right overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted">
                  Accent Color
                </h3>
                <motion.button
                  onClick={handleReset}
                  className="p-1.5 rounded-full hover:bg-muted/10 text-muted transition-colors cursor-pointer"
                  title="Reset to default"
                  whileHover={{ rotate: -180 }}
                  transition={{ duration: 0.5 }}
                >
                  <IconRotate size={14} />
                </motion.button>
              </div>

              {/* Color Grid */}
              <div className="grid grid-cols-6 gap-3">
                {PRESET_COLORS.map((preset) => (
                  <motion.button
                    key={preset.color}
                    onClick={() => {
                      setColor(preset.color);
                      setShowCustom(false);
                    }}
                    className="relative w-full aspect-square rounded-full shadow-sm cursor-pointer"
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {color === preset.color && !showCustom && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <IconCheck size={12} className="text-white drop-shadow-sm" stroke={3} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="space-y-4 pt-2 border-t border-border/50">
                <button
                  onClick={() => setShowCustom(!showCustom)}
                  className="w-full py-2 px-4 rounded-xl bg-muted/5 hover:bg-muted/10 text-xs font-bold text-center transition-colors cursor-pointer"
                >
                  {showCustom ? "Back to presets" : "Custom Color"}
                </button>

                <AnimatePresence mode="wait">
                  {showCustom && ColorPickerComponents && (
                    <motion.div
                      key="custom-picker"
                      className="p-2 custom-color-picker"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <ColorPickerComponents.Picker color={color} onChange={setColor} />
                      <div className="mt-4 flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border border-border shadow-inner shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 relative">
                          <ColorPickerComponents.Input
                            color={color}
                            onChange={setColor}
                            prefixed
                            className="w-full px-3 py-2 rounded-lg bg-muted/5 border border-border text-[10px] font-mono uppercase tracking-widest text-center focus:outline-none focus:border-primary/50 transition-colors"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
