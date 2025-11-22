"use client"
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { NotificationPopover } from '../NotificationPopover';
import { NavigationLink, Container } from '@/components/ui';
import UserMenu from './UserMenu';
import LoginModal from '../auth/LoginModal';
import { Button } from '@/components/ui/button';
import MessageNotificationBadge from '../messaging/MessageNotificationBadge';

const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Courses', href: '/courses' },
    { name: 'Question Bank', href: '/question-bank' },
    { name: 'Articles', href: '/articles' },
    { name: 'Messages', href: '/messages' },
    { name: 'Reports', href: '/reports' },
];

const Header = () => {
    const [activeLink, setActiveLink] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const currentPath = pathname.split('/')[1] || 'dashboard';
        const matchingNavItem = navItems.find(item => item.href.split('/')[1] === currentPath);
        if (matchingNavItem) {
            setActiveLink(matchingNavItem.name.toLowerCase());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, navItems]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="bg-gradient-to-r from-gradient-start to-gradient-end text-gray-700 mb-6 sticky top-0 z-50 shadow-sm">
            <Container size="xl" padding="none">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div
                        className="flex-shrink-0 cursor-pointer"
                        onClick={() => router.push('/')}
                    >
                        <Image
                            src="/TafuriHR_logo.png"
                            alt="Tafuri HR Logo"
                            width={138}
                            height={29}
                            priority
                            className="h-auto w-auto max-w-[100px] sm:max-w-[120px] lg:max-w-[138px]"
                        />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex gap-6">
                        {navItems.map((item) => (
                            <NavigationLink
                                key={item.name}
                                href={item.href}
                                isActive={activeLink === item.name.toLowerCase()}
                                onClick={() => setActiveLink(item.name.toLowerCase())}
                            >
                                {item.name}
                            </NavigationLink>
                        ))}
                    </nav>

                    {/* Right side - User info and notifications */}
                    <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                        {/* Show notifications and messages only if user is logged in */}
                        {session && (
                            <>
                                <MessageNotificationBadge />
                                <button
                                    className="relative hover:scale-110 transition-transform"
                                    aria-label="Notifications"
                                >
                                    <NotificationPopover>
                                        <Image
                                            src="/icons/Bell.png"
                                            alt="Notifications"
                                            width={24}
                                            height={24}
                                            className="w-6 h-6"
                                        />
                                    </NotificationPopover>
                                </button>
                            </>
                        )}

                        {/* Authentication Section */}
                        {status === 'loading' ? (
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                                <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
                            </div>
                        ) : session ? (
                            <div className="hidden sm:block">
                                <UserMenu
                                    user={{
                                        name: session.user.name,
                                        email: session.user.email,
                                        image: session.user.image,
                                        role: session.user.role
                                    }}
                                />
                            </div>
                        ) : (
                            <Button
                                onClick={() => setShowLoginModal(true)}
                                variant="outline"
                                className="hidden sm:block bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            >
                                Sign In
                            </Button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle mobile menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span
                                className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                                    }`}
                            />
                            <span
                                className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''
                                    }`}
                            />
                            <span
                                className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                    <nav className="px-4 pb-4 md:px-6 lg:px-8 space-y-2 bg-white/10 backdrop-blur-sm">
                        {navItems.map((item) => (
                            <NavigationLink
                                key={item.name}
                                href={item.href}
                                isActive={activeLink === item.name.toLowerCase()}
                                variant="mobile"
                                onClick={() => {
                                    setActiveLink(item.name.toLowerCase());
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                {item.name}
                            </NavigationLink>
                        ))}

                        {/* Mobile Authentication Section */}
                        <div className="sm:hidden border-t border-white/20 mt-2 pt-4">
                            {session ? (
                                <div className="px-4 py-3 md:px-6 lg:px-8">
                                    <UserMenu
                                        user={{
                                            name: session.user.name,
                                            email: session.user.email,
                                            image: session.user.image,
                                            role: session.user.role
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="px-4 py-3 md:px-6 lg:px-8">
                                    <Button
                                        onClick={() => {
                                            setShowLoginModal(true);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                        variant="outline"
                                    >
                                        Sign In
                                    </Button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </Container>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                title="Sign in to continue"
                message="Please sign in to access your account and enjoy all features."
            />
        </header>
    );
};

export default Header;