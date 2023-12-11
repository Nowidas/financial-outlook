import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { BarChart, ListIcon, RegexIcon } from "lucide-react";

export function MainNav({
    className,
    location,
    ...props
}): React.HTMLAttributes<HTMLElement> {
    const navigate = useNavigate();
    return (

        <nav className={cn("flex grid-cols-2 gap-2 py-1 px-2 text-sm  transition-colors font-bold", className)}>
            <Link className={cn('p-2 text-sm font-medium transition-colors hover:font-bold flex items-center rounded-lg border-2 ' +
                (location.pathname === '/' ? 'border-[hsl(var(--secondary))]' : 'hover:border-[hsl(var(--primary))] border-transparent'))} onClick={() => { navigate('/'); }} to={'/'}>
                <ListIcon className="w-6 h-6" />
                <div className="ml-2 w-24 text-left  transition-all">
                    Transactions
                </div> </Link>
            <Link className={cn('p-2 text-sm font-medium transition-colors hover:font-bold flex items-center rounded-lg border-2 ' +
                (location.pathname === '/dashboard' ? 'border-[hsl(var(--secondary))]' : 'hover:border-[hsl(var(--primary))] border-transparent'))} onClick={() => { navigate('/dashboard'); }} to={'/dashboard'}>
                <BarChart className="w-6 h-6" />
                <div className="ml-2 w-24 text-left  transition-all">
                    Dashboard
                </div> </Link>
            <Link className={cn('p-2 text-sm font-medium transition-colors hover:font-bold flex items-center rounded-lg border-2 ' +
                (location.pathname === '/category' ? 'border-[hsl(var(--secondary))]' : 'hover:border-[hsl(var(--primary))] border-transparent'))} onClick={() => { navigate('/category'); }} to={'/category'}>
                <RegexIcon className="w-6 h-6" />
                <div className="ml-2 w-32 text-left   transition-all">
                    Types and Rules
                </div> </Link>
        </nav>

    )
}