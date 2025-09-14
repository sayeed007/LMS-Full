"use client"
import { useState } from "react";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { LogoutModal } from "@/components/profile/LogoutModal";
import { NotificationSettingTab } from "@/components/profile/NotificationSettingTab";
import { ManageCategoriesTab } from "@/components/profile/ManageCategoriesTab";
import { AuditLogTab } from "@/components/profile/AuditLogTab";

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
        <div className="min-h-screen bg-off-white-1 flex flex-col">
            <LogoutModal
                open={logoutOpen}
                onOpenChange={setLogoutOpen}
                onConfirm={() => {
                    setLogoutOpen(false);
                    // Add your logout logic here (e.g., signOut(), redirect, etc.)
                }}
            />
            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-64 bg-transparent p-10">
                    <div className="mb-8">
                        <div className="text-20 font-bold text-dark">Welcome, Hafiz</div>
                        <div className="text-14 text-grey-2">Manage your info updated</div>
                    </div>
                    <nav className="flex flex-col gap-2">
                        {sidebarLinks.map(link => (
                            <button
                                key={link.label}
                                onClick={() => setActiveTab(link.label)}
                                className={`text-16 px-2 py-2 rounded text-left transition ${activeTab === link.label
                                    ? "text-info bg-white font-semibold"
                                    : "text-grey-2 hover:text-dark"
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                        <button
                            className="text-16 px-2 py-2 rounded text-error mt-4 text-left"
                            onClick={() => setLogoutOpen(true)}
                        >
                            Logout
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center justify-center p-10 gap-8">
                    {activeTab === "Profile" && <ProfileTab />}
                    {activeTab === "Notification Setting" && <NotificationSettingTab />}
                    {activeTab === "Manage Categories" && <ManageCategoriesTab />}
                    {activeTab === "Audit Log" && <AuditLogTab />}
                </main>
            </div>
        </div>
    );
}