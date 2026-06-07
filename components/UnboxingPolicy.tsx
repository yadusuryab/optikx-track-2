import { IconVideo, IconCircleCheck, IconCircleX, IconAlertTriangle } from "@tabler/icons-react";

export default function UnboxingPolicyBanner() {
  return (
    <div className="max-w-md mx-auto">
      <div className="border border-amber-200 dark:border-amber-900 rounded-lg overflow-hidden">

        {/* Header */}
        <div className="bg-amber-50 dark:bg-amber-950/40 px-4 py-3 flex items-center gap-2.5 border-b border-amber-200 dark:border-amber-900">
          <IconAlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-xs font-semibold tracking-wide uppercase text-amber-800 dark:text-amber-300">
            Unboxing Policy
          </span>
        </div>

        <div className="bg-white dark:bg-[#1a1710] px-4 py-4 space-y-4">

          {/* Main requirement */}
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <IconVideo size={17} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-snug mb-1">
                Record a 360° video before opening
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Film all sides of your <strong>sealed package</strong> in one uncut recording. This protects you if anything arrives damaged.
              </p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Outcomes */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <IconCircleCheck size={16} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Have the video?</span>{" "}
                Returns and damage claims will be processed.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <IconCircleX size={16} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">No video?</span>{" "}
                We won't be able to accept returns or damage claims.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}