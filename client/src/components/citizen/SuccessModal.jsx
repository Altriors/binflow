import { motion, AnimatePresence } from "framer-motion";

export default function SuccessModal({ open, title, message, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="success-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="success-modal"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="success-modal-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 400 }}
            >
              ✓
            </motion.div>
            <h3>{title}</h3>
            <p>{message}</p>
            <div className="success-confetti" aria-hidden>
              {["🎉", "✨", "♻️", "🌿", "✅"].map((e, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], y: [-10, -60], scale: [0.5, 1.2, 0.8], x: (i - 2) * 28 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 1.2 }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
            <button type="button" className="btn btn-primary btn-full" onClick={onClose}>
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
