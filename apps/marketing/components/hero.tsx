import React from 'react'

const Hero = () => {
  return (
    <div className="relative bg-[url('/hero-background.png')] bg-cover bg-center h-screen w-full">
      <div className="absolute inset-0 bg-zinc-50/30 flex justify-center items-center">
        <div className="w-[65%] h-full bg-zinc-50 flex flex-col items-center justify-center p-8 rounded-lg">
          <div className="relative flex flex-col items-start justify-center h-full w-full">
            <img
              src="/logo-art.png"
              alt="Logo Art Background"
              className="absolute inset-0 w-[300px] h-[300px] object-contain z-0 left-[67%] top-[110px] rotate-[45deg]"
            />
           <h1 className='relative z-10 text-6xl font-bold  text-start'>Bring order to your chaos</h1>
           <h1 className='relative z-10 text-6xl font-bold  text-start'> - organise your business adventures</h1>
           <p className='relative z-10 text-zinc-600 text-sm max-w-xl text-start self-center mt-4'>Access 100+ premium data sources and GTM's most used AI research agent, with 140M+ runs monthly. Then automate growth workflows to turn insights into revenue.</p>
          </div>
        </div>
      </div>
      {/* Background overlapping card */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-[calc(50%-5px)] translate-y-[calc(60%+5px)] w-[85%] h-[600px] bg-zinc-600 rounded-xl z-0 p-6" />
      {/* Foreground overlapping card */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[60%] w-[85%] h-[600px] bg-zinc-50 rounded-xl z-10 p-6">
        <h2 className="text-xl font-bold mb-2 text-center text-gray-800">Overlapping Card</h2>
        <p className="text-center text-gray-600">This card overlaps the section below.</p>
      </div>
    </div>
  )
}

export default Hero
