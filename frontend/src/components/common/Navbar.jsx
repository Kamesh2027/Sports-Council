import { Search, Bell, Settings, UserCircle } from "lucide-react";

const Navbar = () => {
  return (
    <header className="topbar">
      {/* TOPBAR */}

      <div className="search-container">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search athletes, teams, or events..."
        />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
        </button>

        <button className="icon-btn">
          <Settings size={20} />
        </button>

        <UserCircle size={30} />
      </div>
    </header>
  );
};

export default Navbar;
