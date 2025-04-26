import React from 'react'

const Hero = () => {
  return (
    <div className="relative bg-[url('/hero-background.png')] bg-cover bg-center h-screen w-full">
      <div className="absolute inset-0 bg-zinc-50/20 flex justify-center items-center">
        <div className="w-[65%] h-full bg-zinc-50 flex flex-col items-center justify-center p-8 rounded-lg">
          <div className="flex flex-col items-center justify-center h-full">
            Bring order to your chaos
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[90%] h-32 bg-white rounded-xl shadow-xl z-10 p-6">
        <h2 className="text-xl font-bold mb-2 text-center text-gray-800">Overlapping Card</h2>
        <p className="text-center text-gray-600">This card overlaps the section below.</p>
      </div>
    </div>
  )
}

export default Hero
