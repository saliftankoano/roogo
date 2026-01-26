/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in child component tree and displays
 * a fallback UI instead of crashing the whole app.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { WarningCircleIcon, ArrowClockwiseIcon } from "phosphor-react-native";
import { tokens } from "@/theme/tokens";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <WarningCircleIcon
              size={64}
              color={tokens.colors.roogo.error}
              weight="fill"
            />
          </View>

          <Text style={styles.title}>Oups, une erreur est survenue</Text>

          <Text style={styles.message}>
            Nous sommes désolés, quelque chose s&apos;est mal passé. Veuillez
            réessayer.
          </Text>

          {__DEV__ && this.state.error && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>{this.state.error.message}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleRetry}
            activeOpacity={0.8}
          >
            <ArrowClockwiseIcon size={20} color="#FFFFFF" weight="bold" />
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${tokens.colors.roogo.error}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[900],
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontFamily: "Urbanist-Medium",
    color: tokens.colors.roogo.neutral[500],
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  debugContainer: {
    backgroundColor: tokens.colors.roogo.neutral[100],
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: "100%",
  },
  debugTitle: {
    fontSize: 12,
    fontFamily: "Urbanist-Bold",
    color: tokens.colors.roogo.neutral[700],
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: "Urbanist-Regular",
    color: tokens.colors.roogo.error,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.roogo.primary[500],
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 100,
    gap: 8,
    shadowColor: tokens.colors.roogo.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: {
    fontSize: 16,
    fontFamily: "Urbanist-Bold",
    color: "#FFFFFF",
  },
});

/**
 * HOC to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode,
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;

