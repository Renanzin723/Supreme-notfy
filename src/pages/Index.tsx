import NotificationDashboard from '@/components/NotificationDashboard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Palette } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/brand')}
          className="flex items-center gap-2"
        >
          <Palette className="h-4 w-4" />
          Escolher Marca
        </Button>
      </div>
      <NotificationDashboard />
    </div>
  );
};

export default Index;