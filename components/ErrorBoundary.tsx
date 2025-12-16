"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">เกิดข้อผิดพลาด</CardTitle>
          <CardDescription>
            เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && error && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-mono text-destructive break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={onReset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              ลองใหม่อีกครั้ง
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/backoffice")}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              กลับหน้าหลัก
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

