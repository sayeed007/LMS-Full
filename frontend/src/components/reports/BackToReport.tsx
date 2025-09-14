import { ArrowLeft } from "lucide-react"
import Link from "next/link"


export const BackToReport = () => {
    return (
        <Link href={`/reports`}>
            <ArrowLeft className="h-5 w-5" />
        </Link>
    )
}