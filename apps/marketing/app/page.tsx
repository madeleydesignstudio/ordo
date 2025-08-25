import { WaitlistForm } from "@/components/waitlist-form";
import { Roadmap } from "@/components/roadmap";

export default function Page() {
  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl flex-1 flex flex-col justify-center">
        {/* Logo Section */}
        <div className="text-center mb-12 sm:mb-16 animate-in fade-in duration-1000">
          <div className="inline-block">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-light tracking-wider mb-2">
              <span className="text-gray-900">ordo</span>
            </h1>
            <div className="h-0.5 bg-blue-500 w-full animate-in slide-in-from-left duration-700 delay-300"></div>
            <p className="text-sm md:text-base text-gray-600 mt-4 font-light animate-in fade-in duration-1000 delay-500">
              organize your world
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 animate-in slide-in-from-bottom duration-1000 delay-700">
          {/* Waitlist Section */}
          <WaitlistForm />

          {/* Roadmap Section */}
          <Roadmap />
        </div>

        {/* Footer */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200 animate-in fade-in duration-1000 delay-1000">
          <p className="text-center text-xs text-gray-500">
            © 2025 ordo — bringing order to your digital world
          </p>
        </div>
      </div>
    </div>
  );
}
