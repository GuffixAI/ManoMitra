// FILE: web/app/(dashboard)/settings/page.tsx

"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Monitor } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings.
        </p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Theme</Label>
            <RadioGroup
              defaultValue={theme}
              onValueChange={(value) => setTheme(value)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Sun className="mb-2 h-6 w-6" />
                  Light
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Moon className="mb-2 h-6 w-6" />
                  Dark
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Monitor className="mb-2 h-6 w-6" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label>Change Password</Label>
                <p className="text-sm text-muted-foreground pb-2">
                    For security, you will be logged out after changing your password.
                </p>
                <Button variant="outline" disabled>
                    Change Password (Coming Soon)
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add this to your components/ui folder if it doesn't exist
// FILE: web/components/ui/radio-group.tsx
// "use client"
// import * as React from "react"
// import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
// import { Circle } from "lucide-react"
// import { cn } from "@/lib/utils"

// const RadioGroup = React.forwardRef<
//   React.ElementRef<typeof RadioGroupPrimitive.Root>,
//   React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
// >(({ className, ...props }, ref) => {
//   return (
//     <RadioGroupPrimitive.Root
//       className={cn("grid gap-2", className)}
//       {...props}
//       ref={ref}
//     />
//   )
// })
// RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

// const RadioGroupItem = React.forwardRef<
//   React.ElementRef<typeof RadioGroupPrimitive.Item>,
//   React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
// >(({ className, ...props }, ref) => {
//   return (
//     <RadioGroupPrimitive.Item
//       ref={ref}
//       className={cn(
//         "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
//         className
//       )}
//       {...props}
//     >
//       <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
//         <Circle className="h-2.5 w-2.5 fill-current text-current" />
//       </RadioGroupPrimitive.Indicator>
//     </RadioGroupPrimitive.Item>
//   )
// })
// RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

// export { RadioGroup, RadioGroupItem }