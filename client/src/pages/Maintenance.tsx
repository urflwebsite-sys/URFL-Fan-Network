import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Maintenance() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🛠️</span>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">URFL Fan Hub: Undergoing a Festive Revamp</CardTitle>
          <CardDescription className="text-lg mt-4 space-y-4">
            <p>
              We're hard at work behind the scenes, preparing an even more magical experience for Season 3 of the URFL. 
              Expect enhanced live stats, a smoother interface, and more ways to connect with your favorite teams.
            </p>
            <p className="font-semibold text-foreground/80 italic">
              "The best is yet to come. Stay tuned for the kickoff!"
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-border/50">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">S3</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Upcoming</div>
            </div>
            <div className="text-center border-x border-border/50">
              <div className="text-xl font-bold text-primary">100%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Effort</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">Live</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Soon</div>
            </div>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                disabled
              />
              <Button size="sm" disabled>Notify Me</Button>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-2">Coming soon: Automated notifications</p>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/login")}
            className="text-muted-foreground hover:text-foreground hover:bg-transparent underline-offset-4 hover:underline"
          >
            Administrator Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
