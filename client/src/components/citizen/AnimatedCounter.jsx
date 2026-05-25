import CountUp from "react-countup";

export default function AnimatedCounter({ value, duration = 1.2 }) {
  return (
    <CountUp
      end={value ?? 0}
      duration={duration}
      preserveValue
      useEasing
      easingFn={(t, b, c, d) => {
        const p = t / d;
        return c * (1 - Math.pow(1 - p, 3)) + b;
      }}
    />
  );
}
