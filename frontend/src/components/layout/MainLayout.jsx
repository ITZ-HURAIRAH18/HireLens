import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Upload, FileText, MessageSquare, GitCompare, History, Settings, Search, Bell, Hexagon, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../lib/auth";

const navigation = [
  { name: "Upload Resume", href: "/", icon: Upload },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analysis", href: "/analysis", icon: FileText },
  { name: "AI Suggestions", href: "/suggestions", icon: MessageSquare },
  { name: "Compare", href: "/compare", icon: GitCompare },
  { name: "History", href: "/history", icon: History },
];

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 bg-white">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-slate-100">
            <Hexagon className="w-8 h-8 text-[#d97757]" />
            <span className="ml-3 text-xl font-semibold tracking-tight text-slate-900">HireLens</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto py-4">
            <nav className="flex-1 px-4 space-y-1">
              {navigation.map((item) => (
                <NavLink key={item.name} to={item.href} className={({ isActive }) => cn(isActive ? "bg-orange-50 text-[#d97757]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900", "group flex items-center px-3 py-2 text-sm font-medium rounded-md")}>
                  <item.icon className={cn("mr-3 flex-shrink-0 h-5 w-5")} aria-hidden="true" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 mt-8 space-y-1">
              <NavLink to="/settings" className={({ isActive }) => cn(isActive ? "bg-orange-50 text-[#d97757]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900", "group flex items-center px-3 py-2 text-sm font-medium rounded-md")}>
                <Settings className="mr-3 flex-shrink-0 h-5 w-5" />
                Settings
              </NavLink>
            </div>
          </div>
          <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 border border-slate-300">
                    {user?.full_name?.charAt(0) || "U"}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-slate-700">{user?.full_name || "User"}</p>
                    <p className="text-xs font-medium text-slate-500">{user?.email || ""}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="p-1 text-slate-400 hover:text-red-500" title="Sign out"><LogOut className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="md:pl-64 flex flex-col flex-1 w-full">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-slate-200">
          <div className="flex-1 px-4 flex justify-between sm:px-6 lg:px-8">
            <div className="flex-1 flex items-center">
              <div className="relative w-full text-slate-400 max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none"><Search className="h-5 w-5" /></div>
                <input className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-slate-900 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 sm:text-sm" placeholder="Search..." type="search" />
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white p-1 rounded-full text-slate-400 hover:text-slate-500"><Bell className="h-6 w-6" /></button>
            </div>
          </div>
        </div>
        <main className="flex-1 focus:outline-none overflow-y-auto">
          <div className="py-6"><div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div></div>
        </main>
      </div>
    </div>
  );
}
