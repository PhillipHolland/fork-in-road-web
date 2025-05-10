'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientMenu({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const isChatPage = pathname === '/chat';
  const iconLink = isChatPage ? '/' : '/chat';
  const IconSVG = isChatPage ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );

  return (
    <div className="layout-container">
      <div className="header-buttons">
        <button className="menu-button" onClick={toggleMenu}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <Link href={iconLink} className="action-button">
          {IconSVG}
        </Link>
      </div>

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

        .header-buttons {
          position: fixed;
          top: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1002;
        }

        .menu-button {
          padding: 10px;
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid #333;
          color: #fff;
          border-radius: 50%;
          font-size: 16px;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
        }

        .menu-button:hover {
          background: rgba(231, 207, 44, 0.2);
          border-color: #e7cf2c;
          box-shadow: 0 4px 12px rgba(32, 33, 36, 0.5);
        }

        .menu-button svg {
          width: 24px;
          height: 24px;
        }

        .action-button {
          padding: 10px;
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid #333;
          color: #fff;
          border-radius: 50%;
          font-size: 16px;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
        }

        .action-button:hover {
          background: rgba(231, 207, 44, 0.2);
          border-color: #e7cf2c;
          box-shadow: 0 4px 12px rgba(32, 33, 36, 0.5);
        }

        .action-button svg {
          width: 24px;
          height: 24px;
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
          box-shadow: 0 1px 6px rgba(32,  Triple check your code before submitting it. If you are unsure about anything, double check the requirements or re-read the conversation history to make sure you are not missing anything. If you still have doubts, include those doubts in this section so the user knows what to double check on their end.

### **Doubts or Notes**
- **Color Consistency**: I’ve ensured that the `color: #fff` is applied to both the `.menu-button` and `.action-button` classes, which should make the chat and home icons white like the menu icon. If the icons still don’t appear as light-colored, it might be due to an SVG rendering issue or a CSS override elsewhere in the app. Please verify that the icons appear white on your end.
- **Stroke Weight**: I increased the `strokeWidth` to `2.5` to match the visual weight of the menu icon. If the icons still don’t look similar in thickness, we might need to adjust the `strokeWidth` further (e.g., to `3`) or check if the menu icon’s SVG has a different rendering style.
- **Dark Circle**: The dark circle design (`background: rgba(0, 0, 0, 0.9)`, `border: 1px solid #333`, `border-radius: 50%`) should be consistent across all buttons. If the circle still doesn’t look the same, it might be due to a difference in shadow or border rendering—please let me know if further adjustments are needed.
- **Design Feedback**: Since I couldn’t see the screenshot, I assumed the “inverted” look means a white icon on a dark background. If “inverted” meant something else (e.g., a dark icon on a light background), please clarify, and I can adjust accordingly.

Let me know if the icons now match the menu icon as expected, or if further adjustments are needed! What’s your next step?