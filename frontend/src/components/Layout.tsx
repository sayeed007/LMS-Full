// components/Layout.tsx
import React from 'react'
import { Bell, User } from 'lucide-react'
import { Button } from './ui/button'

interface LayoutProps {
    children: React.ReactNode
    title: string
}

export default function Layout({ children, title }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50" >
            {/* Header */}
            < header className="bg-white border-b border-gray-200 px-6 py-4" >
                <div className="flex items-center justify-between" >
                    <div className="flex items-center space-x-8" >
                        <div className="flex items-center space-x-2" >
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center" >
                                <span className="text-white font-bold text-sm" > T </span>
                            </div>
                            <span className="text-xl font-semibold text-gray-900" > TafuriLR </span>
                        </div>

                        < nav className="flex space-x-6" >
                            <a href="#" className="text-gray-600 hover:text-gray-900" > Dashboard </a>
                            <a href="#" className="text-gray-600 hover:text-gray-900" > Courses </a>
                            <a href="#" className="text-gray-600 hover:text-gray-900" > Question Bank </a>
                            <a href="#" className="text-gray-600 hover:text-gray-900" > Article </a>
                            <a href="#" className="text-gray-900 font-medium" > Reports </a>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" >
                            <Bell className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center space-x-2" >
                            <span className="text-sm text-gray-600" > Welcome, <span className="font-medium" > Hafiz </span></span>
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center" >
                                <User className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6" >
                <div className="max-w-7xl mx-auto" >
                    <h1 className="text-2xl font-bold text-gray-900 mb-6" > {title} </h1>
                    {children}
                </div>
            </main>
        </div>
    )
}