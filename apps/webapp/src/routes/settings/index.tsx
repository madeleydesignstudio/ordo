// src/routes/settings.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@ordo/ui/components/button";
import { Separator } from "@ordo/ui/components/separator";

export const Route = createFileRoute("/settings/")({
  component: Settings,
});

function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-3">Settings Categories</h3>
            <div className="space-y-1">
              <div className="p-2 rounded hover:bg-accent cursor-pointer text-sm font-medium bg-accent">
                General
              </div>
              <div className="p-2 rounded hover:bg-accent cursor-pointer text-sm">
                Appearance
              </div>
              <div className="p-2 rounded hover:bg-accent cursor-pointer text-sm">
                Notifications
              </div>
              <div className="p-2 rounded hover:bg-accent cursor-pointer text-sm">
                Keyboard Shortcuts
              </div>
              <div className="p-2 rounded hover:bg-accent cursor-pointer text-sm">
                Privacy & Security
              </div>
              <div className="p-2 rounded hover:bg-accent cursor-pointer text-sm">
                Integrations
              </div>
              <div className="p-2 rounded hover:bg-accent cursor-pointer text-sm">
                Advanced
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium">Toggle Sidebar</p>
                  <p className="text-sm text-muted-foreground">
                    Open or close the navigation sidebar
                  </p>
                </div>
                <div className="px-3 py-1 bg-muted rounded border text-sm font-mono">
                  ⌘ + S
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium">Command Search</p>
                  <p className="text-sm text-muted-foreground">
                    Open the command palette to search and navigate
                  </p>
                </div>
                <div className="px-3 py-1 bg-muted rounded border text-sm font-mono">
                  ⌘ + K
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium">Toggle Focus Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Hide all navigation elements for distraction-free work
                  </p>
                </div>
                <div className="px-3 py-1 bg-muted rounded border text-sm font-mono">
                  ⌘ + F
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                    defaultValue="John Doe"
                  />
                  <Button size="sm">Update</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                    defaultValue="john.doe@example.com"
                  />
                  <Button size="sm">Update</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <select className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background">
                  <option>UTC-8 (Pacific Time)</option>
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC+0 (Greenwich Mean Time)</option>
                  <option>UTC+1 (Central European Time)</option>
                </select>
              </div>

              <Separator />

              <div className="space-y-3">
                <label className="text-sm font-medium">Preferences</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Enable notifications
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Receive updates about your projects
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-save drafts</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically save your work
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Dark mode</p>
                      <p className="text-xs text-muted-foreground">
                        Use dark theme
                      </p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all your data
                  </p>
                </div>
                <Button variant="outline">Export</Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Reset Settings</p>
                  <p className="text-sm text-muted-foreground">
                    Restore default settings
                  </p>
                </div>
                <Button variant="outline">Reset</Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account
                  </p>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
