'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ClientMenu({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="layout-container">
      <button className="menu-button" onClick={toggleMenu}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <Link href="/chat" className="chat-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </Link>

      <div className="menu-overlay" onClick={toggleMenu}></div>
      <div className="menu">
        <div className="menu-header">
          <button className="close-menu" onClick={toggleMenu}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="menu-options">
          <Link href="/" className="menu-option-link" onClick={toggleMenu}>
            <div className="menu-option">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Home
            </div>
          </Link>
        </div>
      </div>

      {children}

      <style jsx>{`
        .layout-container {
          min-height: 100vh;
          position: relative;
        }

        .menu-button {
          position: fixed;
          top: 20px;
          left: 20px;
          padding: 8px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid #333;
          color: #fff;
          border-radius: 20px;
          font-size: 16px;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1002;
        }

        .menu-button:hover {
          background: rgba(231, 207, 44, 0.2);
          border-color: #e7cf2c;
          box-shadow: 0 4px 12px rgba(32, 33, 36, 0.5);
        }

        .menu-button svg {
          width: 20px;
          height: 20px;
        }

        .chat-button {
          position: fixed;
          top: 20px;
          left: 68px; /* 20px (menu button left) + 40px (menu button width) + 8px (gap) */
          padding: 8px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid #333;
          color: #fff;
          border-radius: 20px;
          font-size: 16px;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1002;
        }

        .chat-button:hover {
          background: rgba(231, 207, 44, 0.2);
          border-color: #e7cf2c;
          box-shadow: 0 4px 12px rgba(32, 33, 36, 0.5);
        }

        .chat-button svg {
          width: 20px;
          height: 20px;
        }

        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.3);
          z-index: 1000;
          opacity: ${isMenuOpen ? 1 : 0};
          visibility: ${isMenuOpen ? "visible" : "hidden"};
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .menu {
          position: fixed;
          left: 0;
          top: 0;
          height: 100%;
          width: 250px;
          background: #1a1a1a;
          color: #fff;
          border-right: 1px solid #333;
          z-index: 1001;
          transform: ${isMenuOpen ? "translateX(0)" : "translateX(-100%)"};
          transition: transform 0.3s ease;
          padding: 20px;
          box-sizing: border-box;
          font-size: 16px;
          overflow-y: auto;
        }

        .menu-header {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 20px;
        }

        .close-menu {
          padding: 8px;
          background: #333;
          color: #fff;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
          transition: background 0.3s, box-shadow 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-menu:hover {
          background: #e7cf2c;
          color: #000;
          box-shadow: 0 4px 12px rgba(32, 33, 36, 0.5);
        }

        .close-menu svg {
          width: 14px;
          height: 14px;
        }

        .menu-options {
          margin-top: 0;
          margin-bottom: 0;
        }

        .menu-option {
          padding: 10px;
          background: #2a2a2a;
          border-radius: 8px;
          margin-bottom: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, color 0.2s;
        }

        .menu-option:hover {
          background: #3a3a3a;
          color: #e7cf2c;
        }

        .menu-option svg {
          width: 16px;
          height: 16px;
        }

        .menu-option-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        @media (max-width: 850px) {
          .menu-button {
            top: 15px;
            left: 15px;
            padding: 6px;
          }

          .menu-button svg {
            width: 16px;
            height: 16px;
          }

          .chat-button {
            top: 15px;
            left: 58px; /* 15px (menu button left) + 35px (menu button width) + 8px (gap) */
            padding: 6px;
          }

          .chat-button svg {
            width: 16px;
            height: 16px;
          }

          .menu {
            width: 80%;
            max-width: 200px;
          }

          .close-menu {
            padding: 6px;
          }

          .close-menu svg {
            width: 12px;
            height: 12px;
          }

          .menu-option {
            padding: 8px;
            margin-bottom: 8px;
          }

          .menu-option svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </div>
  );
}