export const MessageSkeleton = ({ sent }: { sent?: boolean }) => {
  return (
    <div
      className={`flex w-full items-end gap-2 animate-pulse ${
        sent ? "justify-end" : "justify-start"
      }`}
    >
      {!sent && (
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700"></div>
      )}
      <div
        className={`h-12 rounded-2xl bg-gray-300 dark:bg-gray-700 ${
          sent ? "w-2/3 rounded-br-none" : "w-1/2 rounded-bl-none"
        }`}
      ></div>
    </div>
  );
};
