import Image from "next/image";
const logs = [
    {
        user: { name: "Annette Black", id: "200065", avatar: "/avatars/avatar1.jpg" },
        activity: 'Annette completed the course “UX Fundamentals”.',
        date: "Jan 20, 2025 12:40 PM"
    },
    // ...add more logs as needed
];
export function AuditLogTab() {
    return (
        <div className="bg-white rounded-2xl shadow p-8 w-full max-w-4xl">
            <div className="text-24 font-bold text-dark mb-6">Audit Log</div>
            <input
                className="mb-4 w-full border border-off-white-4 rounded px-4 py-2 text-14"
                placeholder="Search here"
            />
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-off-white-4">
                            <th className="py-2 px-2 text-14 text-dark">User</th>
                            <th className="py-2 px-2 text-14 text-dark">Activity</th>
                            <th className="py-2 px-2 text-14 text-dark">Enroll Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, i) => (
                            <tr key={i} className="border-b border-off-white-4">
                                <td className="py-2 px-2 flex items-center gap-2">
                                    <Image
                                        src={log.user.avatar}
                                        alt={log.user.name}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                    <span className="text-info font-semibold hover:underline cursor-pointer">{log.user.name} | {log.user.id}</span>
                                </td>
                                <td className="py-2 px-2">{log.activity}</td>
                                <td className="py-2 px-2">{log.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}