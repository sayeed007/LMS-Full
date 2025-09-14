"use client"
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NotificationPopover } from '../NotificationPopover';

const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Courses', href: '/courses' },
    { name: 'Question Bank', href: '/question-bank' },
    { name: 'Articles', href: '/articles' },
    { name: 'Reports', href: '/reports' },
];

const Header = () => {
    const [activeLink, setActiveLink] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <div className="flex justify-between items-center px-4 py-4 lg:px-8">
                {/* Logo */}
                <div
                    className="flex-shrink-0"
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
                <nav className="hidden lg:flex gap-5">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`text-gray-600 hover:text-blue-600 px-4 py-1 transition-colors whitespace-nowrap ${activeLink === item.name.toLowerCase()
                                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                                : ''
                                }`}
                            onClick={() => setActiveLink(item.name.toLowerCase())}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Right side - User info and notifications */}
                <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
                    {/* Notification Icon */}
                    <button
                        className="relative hover:scale-110 transition-transform"
                        aria-label="Notifications"
                    >
                        <NotificationPopover>
                            <Image
                                src="/icons/Bell.png"
                                alt="Notifications"
                                width={28}
                                height={28}
                                className="w-6 h-6 sm:w-7 sm:h-7"
                            />
                        </NotificationPopover>
                    </button>

                    {/* User Profile - Hidden on small screens */}
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs sm:text-sm whitespace-nowrap">Welcome, Hafiz</span>
                        <Image
                            src="/Dummy_Profile.png"
                            alt="User Profile"
                            width={32}
                            height={32}
                            className="rounded-full w-7 h-7 sm:w-8 sm:h-8"
                            onClick={() => router.push('/profile')}
                        />
                    </div>

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
                <nav className="px-4 pb-4 space-y-2 bg-white/10 backdrop-blur-sm">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`block text-gray-600 hover:text-blue-600 px-4 py-3 transition-colors rounded-lg hover:bg-white/20 ${activeLink === item.name.toLowerCase()
                                ? 'text-blue-600 bg-white/20'
                                : ''
                                }`}
                            onClick={() => {
                                setActiveLink(item.name.toLowerCase());
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            {item.name}
                        </Link>
                    ))}

                    {/* Mobile User Profile */}
                    <div className="sm:hidden flex items-center gap-3 px-4 py-3 border-t border-white/20 mt-2 pt-4">
                        <Image
                            src="/Dummy_Profile.png"
                            alt="User Profile"
                            width={32}
                            height={32}
                            className="rounded-full w-8 h-8"
                        />
                        <span className="text-sm text-gray-600">Welcome, Hafiz</span>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;