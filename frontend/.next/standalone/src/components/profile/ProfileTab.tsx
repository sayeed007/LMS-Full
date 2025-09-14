import Image from "next/image";
export function ProfileTab() {
    return (
        <div className="bg-white rounded-2xl shadow p-10 w-full max-w-xl">
            <div className="flex flex-col items-center mb-8">
                <div className="w-full h-20 rounded-t-2xl bg-gradient-to-r from-off-white-4 to-off-white-2 mb-[-40px]" />
                <Image
                    src="/avatars/avatar2.jpg"
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-white shadow -mt-10"
                />
                <div className="text-24 font-bold text-dark mt-4">Tahmid Alam</div>
                <div className="text-16 text-grey-2">tahmid.alam@gmail.com</div>
            </div>
            <div>
                <div className="text-16 font-semibold text-dark mb-2">Personal Information</div>
                <div className="grid grid-cols-2 gap-4 text-14">
                    <div>
                        <div className="text-grey-2">ID</div>
                        <div className="font-bold text-dark">200064</div>
                    </div>
                    <div>
                        <div className="text-grey-2">Designation</div>
                        <div className="font-bold text-dark">Team Lead</div>
                    </div>
                    <div>
                        <div className="text-grey-2">Phone No</div>
                        <div className="font-bold text-dark">+88015664578</div>
                    </div>
                    <div>
                        <div className="text-grey-2">Role</div>
                        <div className="font-bold text-dark">Admin Access</div>
                    </div>
                </div>
            </div>
        </div>
    );
}