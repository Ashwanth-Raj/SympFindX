import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, Menu, X, LogOut, User, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setIsMenuOpen(false);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  const navigationLinks = [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'About', path: ROUTES.ABOUT },
    { name: 'Contact', path: ROUTES.CONTACT },
  ];

  const authenticatedLinks = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: Activity },
    { name: 'Diagnosis', path: ROUTES.DIAGNOSIS, icon: Eye },
    { name: 'Reports', path: ROUTES.REPORTS, icon: User },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-navy-950/95 backdrop-blur-md border-navy-800">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to={ROUTES.HOME} 
            className="flex items-center space-x-2 text-white transition-colors duration-300 hover:text-primary-400"
          >
            <div className="relative">
              <Eye className="w-8 h-8 text-primary-500" />
              <div className="absolute w-3 h-3 rounded-full -top-1 -right-1 bg-primary-400 animate-pulse"></div>
            </div>
            <span className="text-xl font-bold font-roboto-slab">SympFindX</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="items-center hidden space-x-8 md:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-all duration-300 hover:text-primary-400 ${
                  isActivePage(link.path) 
                    ? 'text-primary-400 border-b-2 border-primary-400' 
                    : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated && authenticatedLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1 font-medium transition-all duration-300 hover:text-primary-400 ${
                    isActivePage(link.path) 
                      ? 'text-primary-400 border-b-2 border-primary-400' 
                      : 'text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth Buttons */}
          <div className="items-center hidden space-x-4 md:flex">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-navy-300">
                  Welcome, {user?.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-white transition-colors duration-300 hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="font-medium text-white transition-colors duration-300 hover:text-primary-400"
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="btn-primary"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white transition-colors duration-300 md:hidden hover:text-primary-400"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="p-4 mt-2 border rounded-lg md:hidden bg-navy-900/95 backdrop-blur-md border-navy-700">
            <nav className="flex flex-col space-y-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-medium transition-colors duration-300 hover:text-primary-400 ${
                    isActivePage(link.path) ? 'text-primary-400' : 'text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuthenticated && authenticatedLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 font-medium transition-colors duration-300 hover:text-primary-400 ${
                      isActivePage(link.path) ? 'text-primary-400' : 'text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-navy-700">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <p className="text-sm text-navy-300">Welcome, {user?.firstName}</p>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-white transition-colors duration-300 hover:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={() => setIsMenuOpen(false)}
                      className="font-medium text-white transition-colors duration-300 hover:text-primary-400"
                    >
                      Login
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-center btn-primary"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;