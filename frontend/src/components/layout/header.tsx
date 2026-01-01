"use client"
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { NotificationPopover } from '../NotificationPopover';
import { NavigationLink, Container } from '@/components/ui';
import UserMenu from './UserMenu';
import LoginModal from '../auth/LoginModal';
import { Button } from '@/components/ui/button';
import MessageNotificationBadge from '../messaging/MessageNotificationBadge';
import { useModal } from '@/lib/modal-context';
import { useState } from 'react';

// Navigation items in the correct order
// Some items are public (visible to everyone), others are protected (require authentication)
const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', requiresAuth: true },
    { name: 'Courses', href: '/courses', requiresAuth: false },
    { name: 'Question Bank', href: '/question-bank', requiresAuth: true },
    { name: 'Articles', href: '/articles', requiresAuth: false },
    { name: 'Reports', href: '/reports', requiresAuth: true },
    { name: 'Admin', href: '/admin', requiresAuth: true, adminOnly: true },
];

const Header = () => {
    const [activeLink, setActiveLink] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const { openModal, closeModal } = useModal();

    // Check if user is admin
    const isAdmin = session?.user?.role === 'org_admin' || session?.user?.role === 'super_admin';

    // Open login modal
    const handleOpenLogin = () => {
        // Get current URL for redirect after login
        const currentUrl = window.location.pathname + window.location.search;

        openModal(
            <LoginModal
                isOpen={true}
                onClose={() => closeModal()}
                title="Sign in to continue"
                message="Please sign in to access your account and enjoy all features."
                callbackUrl={currentUrl}
            />,
            {
                size: 'md',
                position: 'center',
                showCloseButton: false,
            }
        );
    };

    // Filter navigation items based on auth status and admin role
    const visibleNavItems = navigationItems.filter(item => {
        // Filter out items that require auth if user is not logged in
        if (item.requiresAuth && !session) return false;
        // Filter out admin-only items if user is not admin
        if (item.adminOnly && !isAdmin) return false;
        return true;
    });

    useEffect(() => {
        const currentPath = pathname.split('/')[1] || 'dashboard';
        const matchingNavItem = visibleNavItems.find(item => item.href.split('/')[1] === currentPath);
        if (matchingNavItem) {
            setActiveLink(matchingNavItem.name.toLowerCase());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, isAdmin, session]);

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
                    <nav className="hidden lg:flex gap-3">
                        {visibleNavItems.map((item) => (
                            <NavigationLink
                                key={item.name}
                                href={item.href}
                                isActive={activeLink === item.name.toLowerCase()}
                                onClick={() => setActiveLink(item.name.toLowerCase())}
                            >
                                {item.adminOnly ? (
                                    <span className="flex items-center gap-1">
                                        {item.name}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                    </span>
                                ) : (
                                    item.name
                                )}
                            </NavigationLink>
                        ))}
                    </nav>

                    {/* Right side - User info and notifications */}
                    <div className="flex items-center gap-2 sm:gap-2 lg:gap-2">
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
                                onClick={handleOpenLogin}
                                variant="outline"
                                className="hidden sm:block bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            >
                                Sign In
                            </Button>
                        )}

                        {/* Mobile Menu Button - Always show (for public nav items) */}
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
                        {visibleNavItems.map((item) => (
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
                                {item.adminOnly ? (
                                    <span className="flex items-center gap-1">
                                        {item.name}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                    </span>
                                ) : (
                                    item.name
                                )}
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
                                            handleOpenLogin();
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
        </header>
    );
};

export default Header;