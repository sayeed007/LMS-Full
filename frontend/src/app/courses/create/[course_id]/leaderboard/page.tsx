import Image from "next/image";

// Dummy Data
const dummyData = [
  {
    rank: 1,
    name: "Cameron Williamson",
    id: "200128",
    role: "Software Engineer I",
    time: "28:46",
    score: "10/10",
    avatar: "/Dummy_Profile.png",
  },
  {
    rank: 2,
    name: "Wade Warren",
    id: "200064",
    role: "Software Engineer I",
    time: "28:46",
    score: "08/10",
    avatar: "/assets/images/avatar-2.png",
  },
  {
    rank: 3,
    name: "Catherine Cortez",
    id: "20009",
    role: "Software Engineer I",
    time: "28:46",
    score: "09/10",
    avatar: "/assets/images/avatar-3.png",
  },
  {
    rank: 4,
    name: "Jane Cooper",
    id: "200056",
    role: "Software Engineer I",
    time: "28:46",
    score: "06/10",
    avatar: "/assets/images/avatar-4.png",
  },
  {
    rank: 5,
    name: "Wade Warren",
    id: "200056",
    role: "Software Engineer I",
    time: "28:46",
    score: "06/10",
    avatar: "/assets/images/avatar-5.png",
  },
  {
    rank: 6,
    name: "Esther Howard",
    id: "200056",
    role: "Software Engineer I",
    time: "28:46",
    score: "06/10",
    avatar: "/assets/images/avatar-6.png",
  },
  {
    rank: 7,
    name: "Cameron Williamson",
    id: "200056",
    role: "Software Engineer I",
    time: "28:46",
    score: "06/10",
    avatar: "/assets/images/avatar-7.png",
  },
  {
    rank: 8,
    name: "Brooklyn Simmons",
    id: "200056",
    role: "Software Engineer I",
    time: "28:46",
    score: "06/10",
    avatar: "/assets/images/avatar-8.png",
  },
  {
    rank: 9,
    name: "Leslie Alexander",
    id: "200056",
    role: "Software Engineer I",
    time: "28:46",
    score: "06/10",
    avatar: "/assets/images/avatar-9.png",
  },
  {
    rank: 10,
    name: "Jenny Wilson",
    id: "200056",
    role: "Software Engineer I",
    time: "28:46",
    score: "06/10",
    avatar: "/assets/images/avatar-10.png",
  },
  {
    rank: 11,
    name: "Esther Howard",
    id: "200056",
    role: "Software Engineer I",
    time: "28:46",
    score: "06/10",
    avatar: "/assets/images/avatar-11.png",
  },
];

export default function Leaderboard() {
  // We might want to fetch real data here later
  const topThree = dummyData.slice(0, 3);
  const restList = dummyData.slice(3);

  // Reorder top 3 for podium display (2, 1, 3) because 1 is in the center
  const podiumOrder = [topThree[1], topThree[0], topThree[2]];

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans mb-4">
      {/* Podium Section */}
      <div className="flex justify-between items-end gap-4 mb-12 mt-8 w-full max-w-5xl mx-auto px-10">
        {podiumOrder.map((user) => {
          // Display order is 2nd, 1st, 3rd.
          // user.rank will be 2, 1, 3 respectively.
          const isFirst = user.rank === 1;
          const isSecond = user.rank === 2;
          const isThird = user.rank === 3;

          let badgeSrc = "";
          if (isFirst) badgeSrc = "/assets/gif/first_place_badge.gif";
          if (isSecond) badgeSrc = "/assets/gif/second_place_badge.gif";
          if (isThird) badgeSrc = "/assets/gif/third_place_badge.gif";

          // Adjust sizing based on rank
          const avatarSize = isFirst ? 200 : 150;
          // const translateY = isFirst ? "translate-y-0" : "translate-y-4";

          return (
            <div
              key={user.rank}
              className={`flex flex-col items-center z-10 w-1/3 max-w-[280px]`}
            >
              <div className="relative mb-4">
                {/* Avatar Border/Ring */}
                <div className="rounded-full p-1 bg-gradient-to-b from-[#F2C94C] to-[#F2994A]">
                  <div
                    className="rounded-full overflow-hidden border-4 border-white bg-gray-200 flex items-center justify-center relative shadow-sm"
                    style={{ width: avatarSize, height: avatarSize }}
                  >
                    <Image
                      src="/Dummy_Profile.png"
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Badge with White Background Effect & Border Curve */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  {/* curved border background */}
                  <div className="w-16 h-9 bg-[#f8f9fa] rounded-t-full absolute top-[-8.5px] left-1/2 -translate-x-1/2 border-t-[4px] border-l-[4px] border-r-[4px] border-[#F2994A]/90 box-border z-0"></div>

                  {/* Badge Icon */}
                  <div className="relative flex justify-center z-10 w-12 h-12 mt-0.5">
                    <Image
                      src={badgeSrc}
                      alt={`Rank ${user.rank}`}
                      className="rounded-full"
                      width={46}
                      height={46}
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              <div className="text-center mt-4 w-full px-2">
                <h3 className="font-bold text-gray-900 text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.name}-{user.id}
                </h3>
                <p className="text-gray-500 text-sm mb-2">{user.role}</p>

                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    <Image
                      src="/icons/Time_Spent.png"
                      alt="Time"
                      width={16}
                      height={16}
                    />
                    <span>{user.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    <Image
                      src="/icons/Badge.png"
                      alt="Score"
                      width={16}
                      height={16}
                    />
                    <span>{user.score}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* List Section */}
      <div className="max-w-5xl mx-auto space-y-3">
        {restList.map((user) => (
          <div
            key={user.rank}
            className="bg-white rounded-xl p-4 flex items-center shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Rank */}
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-teal-600 bg-teal-50 rounded-lg text-xl font-bold mr-6">
              {user.rank}
            </div>

            {/* User Info */}
            <div className="flex-grow">
              <h4 className="font-bold text-gray-900">
                {user.name} - {user.id}
              </h4>
              <p className="text-gray-500 text-sm">{user.role}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg border border-purple-100">
                <Image
                  src="/icons/Time_Spent.png"
                  alt="Time"
                  width={20}
                  height={20}
                />
                <span className="font-medium">{user.time}</span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-lg border border-yellow-100">
                <Image
                  src="/icons/Badge.png"
                  alt="Score"
                  width={20}
                  height={20}
                />
                <span className="font-medium">{user.score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
