import { Users } from "lucide-react";

interface ViewerCountProps {
  count: number;
}

const ViewerCount = ({ count }: ViewerCountProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20">
      <Users className="h-4 w-4" />
      <span className="text-sm font-medium">{count} watching</span>
    </div>
  );
};

export default ViewerCount;