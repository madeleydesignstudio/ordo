import { UserMenu } from "./UserMenu";

export function Header() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Journal</h1>
        <UserMenu />
      </div>
    </header>
  );
}
