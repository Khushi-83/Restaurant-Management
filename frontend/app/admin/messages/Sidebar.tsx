import { FaRegComments, FaUser, FaTasks, FaCalendarAlt, FaStar, FaSignOutAlt, FaHome, FaProjectDiagram, FaClock } from "react-icons/fa";

const navItems = [
  { icon: <FaHome />, label: "Dashboard" },
  { icon: <FaProjectDiagram />, label: "Projects" },
  { icon: <FaTasks />, label: "Tasks" },
  { icon: <FaRegComments />, label: "Messages", active: true, badge: 4 },
  { icon: <FaUser />, label: "Users" },
  { icon: <FaClock />, label: "Recently Activity" },
  { icon: <FaCalendarAlt />, label: "Calendar" },
  { icon: <FaStar />, label: "Your Favorite" },
  { icon: <FaUser />, label: "Friend" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r flex flex-col min-h-screen">
      <div className="p-6 font-bold text-xl tracking-tight">MyProject</div>
      <nav className="flex-1">
        <ul>
          {navItems.map((item) => (
            <li
              key={item.label}
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer rounded-lg mx-2 my-1 transition-all ${
                item.active
                  ? "bg-purple-100 text-purple-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 ml-auto">
                  {item.badge}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <button className="flex items-center gap-2 p-6 text-red-500 hover:bg-red-50 transition-all">
        <FaSignOutAlt />
        Log Out
      </button>
    </aside>
  );
} 