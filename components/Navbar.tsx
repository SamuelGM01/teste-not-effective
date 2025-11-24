
import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
    const linkClass = ({ isActive }: { isActive: boolean }) => 
        `relative font-extrabold uppercase tracking-widest text-sm sm:text-base transition-colors duration-300 font-sans px-2 py-1 ${
            isActive ? 'text-white' : 'text-gray-400 hover:text-white'
        } group`;

    return (
        <header className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-sm border-b border-neutral-800 shadow-lg">
            <nav className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-16 py-6 px-4">
                <NavLink to="/" className={linkClass}>
                    Início
                    <span className="absolute bottom-[-8px] left-0 w-0 h-[3px] bg-crimson transition-all duration-300 group-hover:w-full group-[.active]:w-full"></span>
                </NavLink>
                <NavLink to="/ginasios" className={linkClass}>
                    Ginásios
                    <span className="absolute bottom-[-8px] left-0 w-0 h-[3px] bg-crimson transition-all duration-300 group-hover:w-full group-[.active]:w-full"></span>
                </NavLink>
                <NavLink to="/treinadores" className={linkClass}>
                    Treinadores
                    <span className="absolute bottom-[-8px] left-0 w-0 h-[3px] bg-crimson transition-all duration-300 group-hover:w-full group-[.active]:w-full"></span>
                </NavLink>
                <NavLink to="/torneios" className={linkClass}>
                    Torneios
                    <span className="absolute bottom-[-8px] left-0 w-0 h-[3px] bg-crimson transition-all duration-300 group-hover:w-full group-[.active]:w-full"></span>
                </NavLink>
            </nav>
        </header>
    );
};

export default Navbar;
