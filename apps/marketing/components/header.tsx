import React from 'react';

export function Header() {
  return (
    <header className="w-full h-[50px] bg-zinc-50 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 shadow-sm">
      {/* Logo Section - Left */}
      <div className="flex-shrink-0">
        {/* Replace with your actual Logo component or image */}
        <span className="text-lg font-bold">Logo</span>
      </div>

      {/* Links Section - Center */}
      <nav className="flex justify-center flex-grow">
        <a href="/" className="px-3 py-2 text-gray-700 hover:text-black">Product</a>
        <a href="/about" className="px-3 py-2 text-gray-700 hover:text-black">Resources</a>
        <a href="/contact" className="px-3 py-2 text-gray-700 hover:text-black">Company</a>
        <a href="/contact" className="px-3 py-2 text-gray-700 hover:text-black">Pricing</a>
      </nav>

      {/* Login/Auth Section - Right */}
      <div className="flex-shrink-0">
        {/* Replace with your actual Login/Auth component or button */}
        <button className="px-3 py-1 bg-blue-500 text-zinc-50 rounded hover:bg-blue-600 cursor-pointer">
          Login
        </button>
      </div>
    </header>
  );
}

export default Header;
