
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
    href: string;
    label: string;
    icon: string; // boxicon class
}

interface SidebarProps {
    navItems: NavItem[];
    userName: string;
    userJob: string;
    userImage: string;
    userRole?: string;
    onLogout: () => void;
}

export default function Sidebar({ navItems, userName, userJob, userImage, userRole, onLogout }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };
    
    const handleSearchClick = () => {
        if (!isOpen) {
            setIsOpen(true);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 500);
        }
    }

    const profileHref = `/profile?role=${userRole || 'student'}`;

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="logo-details">
                <i className='bx bxl-c-plus-plus icon'></i>
                <div className="logo_name">APSConnect</div>
                <i className='bx bx-menu' id="btn" onClick={handleToggle}></i>
            </div>
            <ul className="nav-list">
                <li>
                    <i className='bx bx-search' onClick={handleSearchClick}></i>
                    <input type="text" placeholder="Search..." ref={searchInputRef} />
                    <span className="tooltip">Search</span>
                </li>
                {navItems.map((item) => (
                    <li key={item.href}>
                        <Link href={item.href} className={pathname === item.href ? 'active' : ''}>
                            <i className={`bx ${item.icon}`}></i>
                            <span className="links_name">{item.label}</span>
                        </Link>
                        <span className="tooltip">{item.label}</span>
                    </li>
                ))}
                <li className="profile">
                    <Link href={profileHref} className="w-full">
                        <div className="profile-details">
                            <img src={userImage} alt="profileImg" />
                            <div className="name_job">
                                <div className="name">{userName}</div>
                                <div className="job">{userJob}</div>
                            </div>
                        </div>
                    </Link>
                    <i className='bx bx-log-out' id="log_out" onClick={onLogout}></i>
                </li>
            </ul>
        </div>
    );
}
