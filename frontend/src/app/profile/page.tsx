"use client"
import { useState } from "react";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { LogoutModal } from "@/components/profile/LogoutModal";
import { NotificationSettingTab } from "@/components/profile/NotificationSettingTab";
import { ManageCategoriesTab } from "@/components/profile/ManageCategoriesTab";
import { AuditLogTab } from "@/components/profile/AuditLogTab";
import { Container } from "@/components/ui";

const sidebarLinks = [
    { label: "Profile" },
    { label: "Notification Setting" },
    { label: "Manage Categories" },
    { label: "Audit Log" },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("Profile");
    const [logoutOpen, setLogoutOpen] = useState(false);

    return (
        <div className="min-h-screen bg-off-white-1">
            <Container size="xl" padding="lg">
                <LogoutModal
                    open={logoutOpen}
                    onOpenChange={setLogoutOpen}
                    onConfirm={() => {
                        setLogoutOpen(false);
                        // Add your logout logic here (e.g., signOut(), redirect, etc.)
                    }}
                />
                
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 bg-white rounded-xl shadow-sm p-8">
                        <div className="mb-8">
                            <h1 className="text-xl font-bold text-gray-900">Welcome, Hafiz</h1>
                            <p className="text-sm text-gray-600">Manage your info updated</p>
                        </div>
                        <nav className="flex flex-col gap-2">
                            {sidebarLinks.map(link => (
                                <button
                                    key={link.label}
                                    onClick={() => setActiveTab(link.label)}
                                    className={`text-sm px-4 py-3 rounded-lg text-left transition-colors ${activeTab === link.label
                                        ? "text-info bg-info/10 font-semibold border border-info/20"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    {link.label}
                                </button>
                            ))}
                            <button
                                className="text-sm px-4 py-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 mt-4 text-left transition-colors"
                                onClick={() => setLogoutOpen(true)}
                            >
                                Logout
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm p-8">
                            {activeTab === "Profile" && <ProfileTab />}
                            {activeTab === "Notification Setting" && <NotificationSettingTab />}
                            {activeTab === "Manage Categories" && <ManageCategoriesTab />}
                            {activeTab === "Audit Log" && <AuditLogTab />}
                        </div>
                    </main>
                </div>
            </Container>
        </div>
    );
}