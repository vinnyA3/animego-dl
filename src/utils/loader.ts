const simpleLoader = (
  {
    prompt,
    timer,
    timeoutMessage,
  }: { prompt?: string; timer?: number; timeoutMessage?: string },
  onTimeout?: () => void
) => {
  let output = "#";
  let maxCount = 20;

  const intervalId = setInterval(() => {
    if (maxCount === 0) {
      process.stdout.write(`\r${timeoutMessage || "Timer has stopped."}\n`);
      clearInterval(intervalId);
      onTimeout && onTimeout();
    } else {
      maxCount -= 1;
      process.stdout.write(`\r${prompt || "[Loading]"} ${output}`);
      output += "#";
    }
  }, timer || 1000);

  return {
    stop: () => {
      clearInterval(intervalId);
      process.stdout.write("\n");
    },
    isRunning: () => {
      return !!intervalId;
    },
  };
};

export default simpleLoader;
