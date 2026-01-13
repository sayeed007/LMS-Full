import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface LandingButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showArrow?: boolean;
  className?: string;
}

const LandingButton = ({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  showArrow = false,
  className = "",
}: LandingButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-lg hover:shadow-blue-500/30 focus:ring-blue-500 border border-transparent",
    secondary:
      "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md focus:ring-gray-200",
    outline:
      "bg-transparent text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm focus:ring-white/50",
    ghost:
      "bg-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  };

  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "text-base px-6 py-3",
    lg: "text-lg px-8 py-4",
  };

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {showArrow && (
        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
      )}
    </>
  );

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className} group`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={combinedClassName}
    >
      {content}
    </motion.button>
  );
};

export default LandingButton;
