import { motion } from "framer-motion";

const item = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function AnimatedCard({
  children,
  className = "",
  delay = 0,
  hover = true,
  as = "div",
  ...props
}) {
  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      variants={item}
      transition={{ delay }}
      whileHover={
        hover
          ? {
              y: -6,
              scale: 1.01,
              transition: { duration: 0.25 },
            }
          : undefined
      }
      {...props}
    >
      {children}
    </Component>
  );
}

export function StaggerGrid({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
      }}
    >
      {children}
    </motion.div>
  );
}
