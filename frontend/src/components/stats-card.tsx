// components/stats-card.tsx
import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: number
    icon: LucideIcon
    iconColor: string
    iconBgColor: string
}

export function StatsCard({ title, value, icon: Icon, iconColor, iconBgColor }: StatsCardProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </Card>
    )
}