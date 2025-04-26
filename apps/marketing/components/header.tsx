'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from 'lucide-react';

export function Header() {
  const [productOpen, setProductOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  return (
    <header className="w-full h-[60px] bg-zinc-50 flex items-center justify-between px-12 fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 ">
      {/* Logo Section - Left */}
      <div className="flex-shrink-0">
        {/* Replace with your actual Logo component or image */}
        <span className="text-lg font-bold">
          <Image src="/logo.png" alt="Logo" width={100} height={50} />
        </span>
      </div>

      {/* Links Section - Center */}
      <nav className="flex justify-center items-center gap-10">
        {/* Product Dropdown */}
        <div onMouseEnter={() => setProductOpen(true)} onMouseLeave={() => setProductOpen(false)}>
          <DropdownMenu open={productOpen} onOpenChange={setProductOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-3 py-2 text-gray-700 hover:text-black hover:bg-transparent data-[state=open]:bg-transparent flex items-center">
                Product
                {productOpen ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onMouseLeave={() => setProductOpen(false)}> {/* Keep open if mouse moves to content */}
              <DropdownMenuItem><a href="/product/feature1">Feature 1</a></DropdownMenuItem>
              <DropdownMenuItem><a href="/product/feature2">Feature 2</a></DropdownMenuItem>
              <DropdownMenuItem><a href="/product/feature3">Feature 3</a></DropdownMenuItem>
              <DropdownMenuItem><a href="/product/integrations">Integrations</a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Resources Dropdown */}
        <div onMouseEnter={() => setResourcesOpen(true)} onMouseLeave={() => setResourcesOpen(false)}>
          <DropdownMenu open={resourcesOpen} onOpenChange={setResourcesOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-3 py-2 text-gray-700 hover:text-black hover:bg-transparent data-[state=open]:bg-transparent flex items-center">
                Resources
                {resourcesOpen ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onMouseLeave={() => setResourcesOpen(false)}> 
              <DropdownMenuItem><a href="/resources/blog">Blog</a></DropdownMenuItem>
              <DropdownMenuItem><a href="/resources/docs">Docs</a></DropdownMenuItem>
              <DropdownMenuItem><a href="/resources/tutorials">Tutorials</a></DropdownMenuItem>
              <DropdownMenuItem><a href="/resources/community">Community</a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Company Dropdown */}
        <div onMouseEnter={() => setCompanyOpen(true)} onMouseLeave={() => setCompanyOpen(false)}>
          <DropdownMenu open={companyOpen} onOpenChange={setCompanyOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-3 py-2 text-gray-700 hover:text-black hover:bg-transparent data-[state=open]:bg-transparent flex items-center">
                Company
                {companyOpen ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onMouseLeave={() => setCompanyOpen(false)}> 
              <DropdownMenuItem><a href="/company/about">About Us</a></DropdownMenuItem>
              <DropdownMenuItem><a href="/company/careers">Careers</a></DropdownMenuItem>
              <DropdownMenuItem><a href="/company/press">Press</a></DropdownMenuItem>
              <DropdownMenuItem><a href="/company/contact">Contact</a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Keep Pricing link as is for now */}
        <a href="/pricing" className="px-3 py-2 text-gray-700 hover:text-black">Pricing</a>
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
