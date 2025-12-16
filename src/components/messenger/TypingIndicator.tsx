export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="w-8 h-8 rounded-full bg-secondary" />
      <div className="bg-message-received px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-typing rounded-full animate-typing-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-typing rounded-full animate-typing-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-typing rounded-full animate-typing-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
