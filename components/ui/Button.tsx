import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from "react-native";
import { cn } from "../../lib/utils"; // Wait, does lib/utils exist in roogo?

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<View, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles = "flex-row items-center justify-center rounded-full";

    const variants = {
      primary: "bg-primary shadow-lg shadow-primary/20",
      secondary: "bg-secondary",
      outline: "border border-neutral-200 bg-transparent",
      ghost: "bg-transparent",
    };

    const textVariants = {
      primary: "text-white font-bold",
      secondary: "text-neutral-900 font-bold",
      outline: "text-primary font-bold",
      ghost: "text-neutral-600 font-bold",
    };

    const sizes = {
      sm: "px-4 py-2",
      md: "px-6 py-3",
      lg: "px-8 py-4",
    };

    const textSize = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    return (
      <TouchableOpacity
        ref={ref}
        disabled={disabled || loading}
        activeOpacity={0.7}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "primary" ? "#FFFFFF" : "#c96a2e"}
            size="small"
          />
        ) : (
          <Text className={cn(textVariants[variant], textSize[size])}>
            {children}
          </Text>
        )}
      </TouchableOpacity>
    );
  },
);

Button.displayName = "Button";
