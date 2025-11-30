import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | POS System",
  description: "Login to POS System",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
