import { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { invoke } from "@tauri-apps/api/core";
import { SignInButton } from "./components/auth/SignInButton";
import { UserButton } from "./components/auth/UserButton";
import { TaskList } from "./components/TaskList";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    const greeting = await invoke("greet", { name: name || user?.firstName || "User" });
    setGreetMsg(greeting as string);
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim()) return;
    if (!user) return;

    setIsUpdating(true);
    try {
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      
      setIsEditing(false);
      setFirstName("");
      setLastName("");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setIsEditing(true);
  };

  return (
    <main className="container">
      {/* Header with Auth */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Ordo Desktop</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <SignInButton />
          <UserButton />
        </div>
      </div>

      {/* Tauri Demo Section */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Desktop Features</h2>
        <div className="row">
          <a href="https://vitejs.dev" target="_blank">
            <img src="/vite.svg" className="logo vite" alt="Vite logo" />
          </a>
          <a href="https://tauri.app" target="_blank">
            <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
          </a>
          <a href="https://reactjs.org" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>

        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder={isSignedIn ? `Enter a name (or leave empty to use ${user?.firstName || 'User'})...` : "Enter a name..."}
          />
          <button type="submit">Greet</button>
        </form>
        {greetMsg && <p style={{ color: '#0f0' }}>{greetMsg}</p>}
      </div>

      {/* User Profile Section */}
      {isSignedIn && isLoaded && (
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Profile Information</h2>
            {!isEditing && (
              <button
                onClick={startEditing}
                style={{ 
                  backgroundColor: '#007acc', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {!isEditing ? (
            // Display mode
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <strong>Email:</strong>
                <p>{user?.primaryEmailAddress?.emailAddress || 'Not provided'}</p>
              </div>
              <div>
                <strong>First Name:</strong>
                <p>{user?.firstName || 'Not provided'}</p>
              </div>
              <div>
                <strong>Last Name:</strong>
                <p>{user?.lastName || 'Not provided'}</p>
              </div>
              <div>
                <strong>Member Since:</strong>
                <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
          ) : (
            // Edit mode
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>First Name:</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Last Name:</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{ 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: isUpdating ? 0.5 : 1
                  }}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ 
                    backgroundColor: '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tasks Section */}
      {isSignedIn && (
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2>My Tasks</h2>
          <TaskList />
        </div>
      )}

      {/* Welcome Message for Non-Authenticated Users */}
      {!isSignedIn && (
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
          <h2>Welcome to Ordo Desktop</h2>
          <p>Sign in to access your profile and sync your data across devices.</p>
          <SignInButton />
        </div>
      )}
    </main>
  );
}

export default App;
