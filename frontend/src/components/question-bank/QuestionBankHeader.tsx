import { Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Input } from "../ui/input";

// Define the props interface
interface QuestionBankHeaderProps {
    activeTab: "my" | "all";
    setActiveTab: Dispatch<SetStateAction<"my" | "all">>;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}

// Define the component with typed props
const QuestionBankHeader: React.FC<QuestionBankHeaderProps> = ({
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
}) => {

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-semibold">Question Bank</h1>
                </div>

                <div className="relative w-80 ">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search here"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-off-white-4 w-[270px] h-[40px]"
                    />
                </div>
            </div>

            <div className="flex gap-1 border-b border-off-white-4">
                <button
                    className={`cursor-pointer pr-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "my"
                        ? "border-blue-600 text-blue-600 font-bold"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    onClick={() => setActiveTab("my")}
                >
                    My Question
                </button>
                <button
                    className={`cursor-pointer px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "all"
                        ? "border-blue-600 text-blue-600 font-bold"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    onClick={() => setActiveTab("all")}
                >
                    All Question
                </button>
            </div>
        </>
    )
}

export default QuestionBankHeader;