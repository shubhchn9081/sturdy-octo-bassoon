import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-[#172B3A] border-[#243442]">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-[#a3bfcd]">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="mt-6">
            <button 
              className="bg-[#1375e1] hover:bg-[#0e5dba] text-white py-2 px-4 rounded-md"
              onClick={() => window.location.href = '/'}
            >
              Return Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
