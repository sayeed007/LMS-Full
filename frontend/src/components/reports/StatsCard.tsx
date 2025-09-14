import Image from "next/image"
import { Card } from "../ui/card"

interface StatsCardProps {
    iconName: string
    iconAlt: string
    title: string
    value: number
}

export const StatsCard = ({ iconName, iconAlt, title, value }: StatsCardProps) => {

    return (
        <Card className="p-4">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg`}>
                    {iconName &&
                        <Image
                            src={iconName}
                            alt={iconAlt}
                            width={46}
                            height={46}
                            className="w-[46px] h-[46px]"
                        />
                    }
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-semibold">{value}</p>
                </div>
            </div>
        </Card>
    )
}