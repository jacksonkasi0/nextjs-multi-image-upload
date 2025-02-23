"use client";

import React from "react";
import { Github, Sun, Moon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import Link from "next/link";

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="w-full">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-foreground" />
          <span className="text-lg font-semibold text-foreground">Uploader</span>
        </div>

        {/* GitHub Link & Theme Toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/jacksonkasi0/nextjs-multi-image-upload"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
          >
            <Github className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-foreground" />
            )}
          </Button>
        </div>
      </div>
      {/* Divider */}
      <Separator className="w-full bg-border" />
    </header>
  );
};

export default Header;