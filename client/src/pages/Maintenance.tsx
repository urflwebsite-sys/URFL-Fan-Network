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
          <CardTitle className="text-2xl font-bold">Site Revamp in Progress</CardTitle>
          <CardDescription className="text-lg mt-2">
            We're currently revamping our website to bring you a better experience. 
            Please check back soon!
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/login")}
            className="text-muted-foreground hover:text-foreground"
          >
            Admin Access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
