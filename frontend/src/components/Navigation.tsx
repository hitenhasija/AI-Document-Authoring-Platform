import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoginPage = location.pathname === "/login";

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">O</span>
            </div>
            <span className="text-xl font-semibold text-foreground">Ocean AI</span>
          </div>
          
          {!isLoginPage && (
            <Button 
              variant="outline"
              onClick={() => navigate("/login")}
              className="transition-colors"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
