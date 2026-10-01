"use client";

import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { SearchBox } from "@/components/SearchBox";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartButton } from "@/components/CartButton";

export interface HeroNavItem { name: string; href: string }
export interface HeroCategory { title: string; href: string; image?: string; emoji?: string }

export interface CommerceHeroProps {
  /** Название сайта (текст рядом с логотипом) */
  brand: string;
  /** Картинка логотипа; если нет — эмодзи */
  logo?: string;
  logoEmoji?: string;
  showBrandText?: boolean;
  navigation: HeroNavItem[];
  /** Первая строка заголовка — градиентом, вторая — обычная */
  title1: string;
  title2?: string;
  subtitle?: string;
  cta: { label: string; href: string };
  categories: HeroCategory[];
}

function Brand({ brand, logo, logoEmoji, showBrandText }: Pick<CommerceHeroProps, "brand" | "logo" | "logoEmoji" | "showBrandText">) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={brand}>
      {logo
        ? <img src={logo} alt={brand} className="h-9 w-auto max-w-[140px] object-contain rounded-md" />
        : <span className="text-2xl leading-none">{logoEmoji || "🧶"}</span>}
      {showBrandText !== false && (
        <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {brand}
        </span>
      )}
    </Link>
  );
}

export function CommerceHero({
  brand, logo, logoEmoji, showBrandText, navigation, title1, title2, subtitle, cta, categories,
}: CommerceHeroProps) {
  return (
    <div className="w-full relative container px-2 mx-auto max-w-7xl pb-10">

        <div className="mt-6 rounded-[28px] relative bg-white/45 dark:bg-[#211722]/55 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_24px_70px_rgba(120,50,90,.10)] overflow-hidden">
          <header className="flex items-center">
            <div className="w-full md:w-2/3 lg:w-auto lg:max-w-[78%] bg-white/85 dark:bg-[#211722]/85 backdrop-blur-md p-4 lg:pr-5 rounded-br-[24px] flex items-center gap-3 lg:gap-5">
              <Brand brand={brand} logo={logo} logoEmoji={logoEmoji} showBrandText={showBrandText} />

              <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
                {navigation.map((item) => (
                  <Button
                    key={item.name + item.href}
                    asChild
                    variant="link"
                    className="cursor-pointer relative group text-foreground hover:text-primary transition-colors whitespace-nowrap px-2 xl:px-3"
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </Button>
                ))}
                <SearchBox compact />
                <ThemeToggle />
                <CartButton />
              </nav>

              <Sheet>
                <div className="lg:hidden ml-auto flex items-center gap-1.5"><ThemeToggle /><CartButton /><SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:text-primary transition-colors" aria-label="Меню">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger></div>
                <SheetContent
                  side="left"
                  className="w-[300px] sm:w-[400px] p-0 bg-background/95 backdrop-blur-md border-r border-border/50"
                >
                  <SheetHeader className="p-6 text-left border-b border-border/50">
                    <SheetTitle className="flex items-center justify-between">
                      <Brand brand={brand} logo={logo} logoEmoji={logoEmoji} showBrandText={showBrandText} />
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col p-6 space-y-1">
                    {navigation.map((item) => (
                      <Button
                        key={item.name + item.href}
                        asChild
                        variant="ghost"
                        className="justify-start px-2 h-12 text-base font-medium hover:bg-accent/50 hover:text-primary transition-colors"
                      >
                        <Link href={item.href}>{item.name}</Link>
                      </Button>
                    ))}
                  </nav>
                  <Separator className="mx-6" />
                  <div className="p-6 flex items-center gap-3">
                    <SearchBox />
                    <ThemeToggle />
                    <CartButton label />
                  </div>
                  <Separator className="mx-6" />
                  <div className="p-6">
                    <Button asChild className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl">
                      <Link href={cta.href}>
                        {cta.label}
                        <ArrowUpRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="hidden md:flex justify-end items-center pr-4 gap-4 ml-auto shrink-0">
              <Button
                asChild
                variant="secondary"
                className="cursor-pointer bg-white/90 dark:bg-[#211722]/90 text-foreground p-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group h-auto hover:bg-white"
              >
                <Link href={cta.href}>
                  <span className="pl-4 py-2 text-sm font-medium">{cta.label}</span>
                  <span className="rounded-full flex items-center justify-center m-auto bg-[#F4B3C2] dark:bg-[#4a2733] w-10 h-10 ml-2 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5" />
                  </span>
                </Link>
              </Button>
            </div>
          </header>

          <motion.section
            className="w-full px-4 py-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="mx-auto text-center">
              <motion.h1
                className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                <span className="text-foreground">
                  {title1}
                </span>
                {title2 && (
                  <>
                    <br />
                    <span className="text-primary">{title2}</span>
                  </>
                )}
              </motion.h1>
              {subtitle && (
                <motion.p
                  className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </motion.section>
        </div>

        {categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mt-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.title + category.href}
                className="group relative bg-white dark:bg-[#241823] border border-white/80 dark:border-white/10 rounded-3xl p-4 sm:p-6 min-h-[250px] sm:min-h-[300px] w-full overflow-hidden shadow-[0_14px_40px_rgba(120,50,90,.08)] hover:shadow-[0_24px_60px_rgba(120,50,90,.14)] hover:-translate-y-1 transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              >
                <Link href={category.href} className="absolute inset-0 z-20">
                  <h2 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-[clamp(1.5rem,4vw,2.5rem)] font-bold relative z-10 text-foreground my-2 sm:my-4 group-hover:text-primary transition-colors duration-300">
                    {category.title}
                  </h2>
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full max-w-[min(40vw,200px)] sm:max-w-[min(30vw,180px)] md:max-w-[min(25vw,160px)] lg:max-w-[min(20vw,140px)] h-auto object-contain opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"
                      />
                    ) : (
                      <span className="text-[96px] sm:text-[110px] leading-none opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 select-none" aria-hidden="true">
                        {category.emoji || "🧶"}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-[#F7F3FA] dark:bg-[#2e1d29] rounded-tl-xl flex items-center justify-center z-10">
                    <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-10 h-10 md:w-12 md:h-12 bg-[#EAF4FC] dark:bg-[#263040] text-foreground rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
}
