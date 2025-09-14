// app/reports/individual-learner/page.tsx
"use client";
import { GoBackRoute } from '@/components/reports/GoBackRoute';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Download } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock data for learners
const mockLearners = [
    { value: '200065', label: 'MD. Fahim Reza' },
    { value: '200066', label: 'Wade Warren' },
    { value: '200067', label: 'Jerome Bell' },
];


export default function IndividualLearnerReport() {
    const router = useRouter();
    const params = useParams();
    const learnerId = params.id as string;
    const [selectedLearner, setSelectedLearner] = useState<string | null>(learnerId);

    useEffect(() => {
        if (selectedLearner) {
            router.push(`/reports/individual-learner/${selectedLearner}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLearner]);


    return (
        <>
            <div className="space-y-6 bg-white p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <GoBackRoute />
                        <CustomSelect
                            options={mockLearners}
                            value={selectedLearner}
                            onChange={setSelectedLearner}
                            placeholder="Select a Learner"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Individual Learner Report</h1>
                    <div className="flex items-center gap-4">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            <Download className="w-4 h-4 mr-2" />
                            Export as CSV
                        </Button>
                    </div>
                </div>


                {/* Content */}
                <div className='flex w-full h-[60vh] justify-center items-center'>
                    No Learner is selected
                </div>
            </div>
        </>

    );
}