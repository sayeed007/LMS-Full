import { type OrganizationPopulated } from '@/store/api/organizationApi';
import { BarChart3, BookOpen, Building2, Users } from 'lucide-react';

type TabType = 'info' | 'members' | 'courses' | 'stats';

interface TabNavigationProps {
  activeTab: TabType;
  organization: OrganizationPopulated;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, organization, onTabChange }: TabNavigationProps) {
  const tabs = [
    {
      id: 'info' as TabType,
      label: 'Information',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      id: 'members' as TabType,
      label: 'Members',
      icon: <Users className="w-5 h-5" />,
      count: organization.memberCount
    },
    {
      id: 'courses' as TabType,
      label: 'Courses',
      icon: <BookOpen className="w-5 h-5" />,
      count: organization.coursesCount
    },
    {
      id: 'stats' as TabType,
      label: 'Statistics',
      icon: <BarChart3 className="w-5 h-5" />
    }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 border-b-2 transition ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count ? (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              ) : null}
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}
