import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";

export function MainNav({
    className,
    ...props
}): React.HTMLAttributes<HTMLElement> {
    const navigate = useNavigate();
    return (
        <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
            <Link className={cn('text-sm font-medium transition-colors hover:font-bold')} onClick={() => { navigate('/'); }}> AggrementsPage </Link>
        </nav>
    )
}