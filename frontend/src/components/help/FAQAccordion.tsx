"use client";

import { useState } from "react";
import Link from "next/link";
import { FAQ } from "@/types/help.types";
import { HELP_CATEGORIES } from "@/services/help/help.seed";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ExternalLink, HelpCircle } from "lucide-react";

interface FAQAccordionProps {
  faqs: FAQ[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (faqs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center bg-card/40">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <HelpCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">No FAQs Found</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          We couldn&apos;t find any FAQs matching your search criteria. Try different keywords or browse by category.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = !!openIds[faq.id];
        const categoryMeta = HELP_CATEGORIES.find((c) => c.id === faq.category);

        return (
          <div
            key={faq.id}
            className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200"
          >
            {/* Question Header / Trigger */}
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-muted/40 transition-colors"
              aria-expanded={isOpen}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase">
                    {categoryMeta?.label || faq.category}
                  </Badge>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug pt-1">
                  {faq.question}
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 mt-1 ${
                  isOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {/* Answer Content */}
            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-border/40 text-sm">
                <p className="text-foreground/85 leading-relaxed text-xs sm:text-sm">
                  {faq.answer}
                </p>

                {/* Keywords & Direct Link */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {faq.keywords.slice(0, 3).map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={ROUTES.HELP_FAQ_DETAIL(faq.slug)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Dedicated Article
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
