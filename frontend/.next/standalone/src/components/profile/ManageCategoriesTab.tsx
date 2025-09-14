const categories = [
    "Design & Development",
    "Business & Management",
    "Technology & Development",
    "Design & Development",
    "Personal Development & Learning",
    "Health & Wellness",
    "Data & Analytics",
    "Design & Creative Arts",
];
export function ManageCategoriesTab() {
    return (
        <div className="bg-white rounded-2xl shadow p-10 w-full max-w-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="text-24 font-bold text-dark">Manage Category</div>
                <button className="bg-info text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-info/90 transition">Create Category</button>
            </div>
            <div className="divide-y divide-off-white-4">
                {categories.map((cat, idx) => (
                    <div key={cat + idx} className="flex items-center justify-between py-4">
                        <span className="text-16 font-semibold text-dark">{cat}</span>
                        <button className="text-grey-2 text-2xl px-2 hover:text-dark transition">⋮</button>
                    </div>
                ))}
            </div>
        </div>
    );
}