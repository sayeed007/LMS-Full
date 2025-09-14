// lib/animations/variants.ts

import { Variants, TargetAndTransition } from "framer-motion"

// =============================================================================
// CONTAINER VARIANTS (for parent elements that control stagger)
// =============================================================================

export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
}

export const fastStaggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.05
        }
    }
}

export const slowStaggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

// =============================================================================
// FADE ANIMATIONS
// =============================================================================

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut" }
    }
}

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 20,
            duration: 0.6
        }
    }
}

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 20,
            duration: 0.6
        }
    }
}

export const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 20
        }
    }
}

export const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 20
        }
    }
}

export const fadeInUpHeroSection: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 20,
            duration: 0.3
        }
    }
}

// =============================================================================
// SCALE ANIMATIONS
// =============================================================================

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
}

export const scaleInBouncy: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 10
        }
    }
}

// =============================================================================
// CARD ANIMATIONS
// =============================================================================

export const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
}

export const cardSlideUp: Variants = {
    hidden: {
        opacity: 0,
        y: 40,
        scale: 0.9
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 120,
            damping: 18
        }
    }
}

// =============================================================================
// BUTTON/INTERACTIVE ELEMENT ANIMATIONS
// =============================================================================

export const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 150,
            damping: 20
        }
    }
}

// =============================================================================
// HEADER/TITLE ANIMATIONS
// =============================================================================

export const headerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 20,
            duration: 0.6
        }
    }
}

export const titleVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.2
        }
    }
}

// =============================================================================
// ADVANCED ANIMATIONS
// =============================================================================

export const slideInFromBottom: Variants = {
    hidden: {
        opacity: 0,
        y: 50,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 1
        }
    }
}

export const slideInFromTop: Variants = {
    hidden: {
        opacity: 0,
        y: -50,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    }
}

export const rotateIn: Variants = {
    hidden: {
        opacity: 0,
        rotate: -10,
        scale: 0.9
    },
    visible: {
        opacity: 1,
        rotate: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 120,
            damping: 15
        }
    }
}

export const featureItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: index * 0.1,
            duration: 0.5,
            type: "spring",
            stiffness: 100
        }
    })
}


// =============================================================================
// UTILITY FUNCTIONS FOR CUSTOM VARIANTS
// =============================================================================

export const createFadeInWithDelay = (delay: number): Variants => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6, delay }
    }
})

export const createSlideInWithDirection = (direction: 'up' | 'down' | 'left' | 'right', distance: number = 30): Variants => {
    const getInitialPosition = () => {
        switch (direction) {
            case 'up': return { y: distance }
            case 'down': return { y: -distance }
            case 'left': return { x: distance }
            case 'right': return { x: -distance }
        }
    }

    return {
        hidden: {
            opacity: 0,
            ...getInitialPosition()
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    }
}

export const createStaggerContainer = (staggerDelay: number, childrenDelay: number = 0): Variants => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: childrenDelay
        }
    }
})

// =============================================================================
// HOVER ANIMATIONS (for whileHover prop) - Properly Typed
// =============================================================================

export const hoverLift: TargetAndTransition = {
    y: -4,
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 20 }
}

export const hoverScale: TargetAndTransition = {
    scale: 1.05,
    transition: { type: "spring", stiffness: 300, damping: 20 }
}

export const hoverBounce: TargetAndTransition = {
    scale: 1.1,
    transition: { type: "spring", stiffness: 400, damping: 10 }
}

export const iconHover: TargetAndTransition = {
    scale: 1.1,
    rotate: [0, -5, 5, 0],
    transition: {
        rotate: { duration: 0.5, ease: "easeInOut" },
        scale: { type: "spring", stiffness: 300, damping: 20 }
    }
}

export const textColorHover: TargetAndTransition = {
    color: "#2563eb",
    transition: { duration: 0.2 }
}

// =============================================================================
// TAP ANIMATIONS (for whileTap prop) - Properly Typed
// =============================================================================

export const tapScale: TargetAndTransition = { scale: 0.98 }
export const tapScaleSmall: TargetAndTransition = { scale: 0.95 }
export const tapBounce: TargetAndTransition = {
    scale: 0.9,
    transition: { type: "spring", stiffness: 400, damping: 17 }
}

// =============================================================================
// VIEWPORT CONFIGURATIONS (commonly used)
// =============================================================================

export const defaultViewport = { once: true, amount: 0.3 }
export const partialViewport = { once: true, amount: 0.2 }
export const fullViewport = { once: true, amount: 0.8 }

// =============================================================================
// COMMON COMBINATIONS (pre-made animation sets)
// =============================================================================

export const cardWithHover = {
    variants: cardVariants,
    whileHover: hoverLift,
    whileTap: tapScale,
}

export const iconWithHover = {
    whileHover: iconHover,
    whileTap: tapScaleSmall,
}


// =============================================================================
// CUSTOM VARIANTS
// =============================================================================

// Custom backdrop variant for smooth overlay animation
export const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

// Enhanced popup container variant with smooth entry
export const popupContainerVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: 50
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 120,
            damping: 20,
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 50,
        transition: { duration: 0.2 }
    }
};

// Custom variant for the header section
export const headerContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1
        }
    }
};

export const contactCardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    }
};

// Custom variants for FAQ-specific animations
export const sidebarItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: index * 0.1,
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    })
};

export const faqItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: index * 0.05,
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    })
};

export const answerVariants: Variants = {
    hidden: {
        opacity: 0,
        height: 0,
        y: -10
    },
    visible: {
        opacity: 1,
        height: "auto",
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut",
            opacity: { delay: 0.1 }
        }
    },
    exit: {
        opacity: 0,
        height: 0,
        y: -10,
        transition: {
            duration: 0.2,
            ease: "easeIn"
        }
    }
};

export const sectionTitleVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    }
};

// Custom variants for the features page
export const subtitleVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    }
};

export const gridContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.3
        }
    }
};

export const featureCardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.9
    },
    visible: (index: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: index * 0.05
        }
    })
};

export const learnMoreVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 20
        }
    }
};