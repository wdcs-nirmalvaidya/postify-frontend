"use client";

export const TypingIndicator = () => {
    return (
        <div className="flex items-center gap-1">
            <span className="text-xs text-blue-500 dark:text-blue-400 italic">typing</span>
            <div className="flex items-end gap-0.5">
                {[0, 0.15, 0.3].map((delay, i) => (
                    <span
                        key={i}
                        className="block w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}s`, animationDuration: "0.9s" }}
                    />
                ))}
            </div>
        </div>
    );
};
