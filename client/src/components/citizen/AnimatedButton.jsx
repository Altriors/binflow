import { motion } from "framer-motion";

export default function AnimatedButton({
  children,
  className = "",
  type = "button",
  disabled = false,
  onClick,
  asLink = false,
  href,
  ...rest
}) {
  const motionProps = {
    className,
    whileHover: disabled ? undefined : { scale: 1.03, y: -2 },
    whileTap: disabled ? undefined : { scale: 0.97 },
    transition: { type: "spring", stiffness: 420, damping: 22 },
  };

  if (asLink) {
    return (
      <motion.a href={href} {...motionProps} {...rest}>
        <span className="btn-ripple-host">{children}</span>
      </motion.a>
    );
  }

  return (
    <motion.button type={type} disabled={disabled} onClick={onClick} {...motionProps} {...rest}>
      <span className="btn-ripple-host">{children}</span>
    </motion.button>
  );
}
