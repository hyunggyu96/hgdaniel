import React, { useState, useRef, useCallback, useEffect } from "react";
import { StyleSheet, TextInput, View, Pressable } from "react-native";
import { Search, X } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchInput({ value, onChangeText, placeholder, debounceMs = 400 }: SearchInputProps) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes (e.g. clear from parent)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((text: string) => {
    setLocalValue(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChangeText(text), debounceMs);
  }, [onChangeText, debounceMs]);

  const handleClear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLocalValue("");
    onChangeText("");
  }, [onChangeText]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.04)",
          borderColor: focused ? colors.primary : "transparent",
        },
      ]}
    >
      <Search size={16} color={colors.textMuted} />
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        value={localValue}
        onChangeText={handleChange}
        placeholder={placeholder || t("search")}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {localValue.length > 0 && (
        <Pressable onPress={handleClear}>
          <X size={16} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
});
