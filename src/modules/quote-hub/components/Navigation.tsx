import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Sprout, User, LogOut, Settings, BarChart3, FileText, Package, Tag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">AgriQuote Pro</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`transition-colors ${isActive('/')
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-primary'
                }`}
            >
              Accueil
            </Link>
            <Link
              to="/quote"
              className={`transition-colors ${isActive('/quote')
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-primary'
                }`}
            >
              Demander un devis
            </Link>

            {profile?.role === 'admin' || profile?.role === 'staff' ? (
              <Link
                to="/admin"
                className={`transition-colors ${isActive('/admin')
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-primary'
                  }`}
              >
                Administration
              </Link>
            ) : null}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{profile?.full_name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <div className="flex flex-col items-start px-2 py-1.5">
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {profile?.role && (
                        <p className="text-xs text-primary capitalize">{profile.role}</p>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  {(profile?.role === 'admin' || profile?.role === 'staff') && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/quotes" className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Devis
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/services" className="flex items-center">
                          <Package className="w-4 h-4 mr-2" />
                          Services
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/categories" className="flex items-center">
                          <Tag className="w-4 h-4 mr-2" />
                          Catégories
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem
                    onClick={signOut}
                    className="flex items-center text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Se connecter</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/quote">Demander un devis</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;