import { NavLink, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function NavBar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    navigate('/');
  };

  return (
    <nav className="bg-warm-white border-b border-peach/40 px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between sm:grid sm:grid-cols-3">

        {/* App name */}
        <div className="flex items-center">
          <NavLink
            to="/dashboard"
            className="text-lg sm:text-xl font-bold text-warm-gray"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Ember
          </NavLink>
        </div>

        {/* Nav links */}
        <div className="flex items-center justify-center gap-2 sm:gap-6">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-xs sm:text-sm font-semibold transition-colors duration-200 ${
                isActive ? 'text-ember' : 'text-muted hover:text-warm-gray'
              }`
            }
          >
            Today
          </NavLink>
          <NavLink
            to="/collection"
            className={({ isActive }) =>
              `text-xs sm:text-sm font-semibold transition-colors duration-200 ${
                isActive ? 'text-ember' : 'text-muted hover:text-warm-gray'
              }`
            }
          >
            Collection
          </NavLink>
          <NavLink
            to="/add"
            className="bg-ember text-white text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-ember-dark transition-colors duration-300 whitespace-nowrap"
          >
            + Add
          </NavLink>
        </div>

        {/* User info + logout */}
        {user && (
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <span className="text-sm text-muted hidden sm:block">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm text-muted hover:text-warm-gray font-semibold transition-colors duration-200 cursor-pointer"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
