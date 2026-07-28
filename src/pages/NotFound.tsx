import { Link } from 'react-router-dom';
import { Gift, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <span className="text-[120px] font-display font-bold text-primary-100 leading-none">404</span>
          <Gift size={48} className="text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">Page Not Found</h1>
        <p className="text-slate-500 mb-8">
          Looks like this gift got lost in delivery. The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button className="gap-2"><Home size={16} /> Go Home</Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft size={16} /> Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
