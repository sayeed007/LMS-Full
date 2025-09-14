import { useState } from "react";
export function NotificationSettingTab() {
    const [emailNotif, setEmailNotif] = useState(true);
    const [courseEnroll, setCourseEnroll] = useState(true);
    const [courseComplete, setCourseComplete] = useState(true);
    const [articleLike, setArticleLike] = useState(false);
    const [articleComment, setArticleComment] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow p-10 w-full max-w-xl">
            <div className="text-24 font-bold text-dark mb-6">Notification Setting</div>
            <div className="flex items-center justify-between mb-2">
                <div>
                    <div className="text-16 font-semibold text-dark">Email Notification</div>
                    <div className="text-14 text-grey-2 max-w-md">
                        Manage your notification preferences to reduce email volume from Zoho Learn. To stop receiving emails entirely, you can disable email notifications.
                    </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif(v => !v)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-off-white-4 peer-checked:bg-info rounded-full relative transition">
                        <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${emailNotif ? 'translate-x-5' : ''}`}></div>
                    </div>
                </label>
            </div>
            <hr className="my-6 border-off-white-4" />
            <div className="mb-4">
                <div className="text-16 font-semibold text-dark mb-2">Course</div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-14 text-dark">When anyone enroll course</span>
                    <input type="checkbox" checked={courseEnroll} onChange={() => setCourseEnroll(v => !v)} className="w-5 h-5 accent-info rounded" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-14 text-dark">When any one complete course</span>
                    <input type="checkbox" checked={courseComplete} onChange={() => setCourseComplete(v => !v)} className="w-5 h-5 accent-info rounded" />
                </div>
            </div>
            <hr className="my-6 border-off-white-4" />
            <div className="mb-2">
                <div className="text-16 font-semibold text-dark mb-2">Article</div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-14 text-dark">When anyone like article</span>
                    <input type="checkbox" checked={articleLike} onChange={() => setArticleLike(v => !v)} className="w-5 h-5 accent-info rounded" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-14 text-dark">Notify when a new comment is added</span>
                    <input type="checkbox" checked={articleComment} onChange={() => setArticleComment(v => !v)} className="w-5 h-5 accent-info rounded" />
                </div>
            </div>
        </div>
    );
}