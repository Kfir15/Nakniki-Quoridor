import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@radix-ui/themes';

export default function RefreshButton({ refresh }: { refresh: () => void | Promise<void> }) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleClick = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        try { await refresh(); }
        finally { setIsRefreshing(false); }
    };

    return (
        <Button variant="ghost" color="gray" onClick={handleClick} disabled={isRefreshing} style={{ cursor: 'pointer' }}>
            <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} style={{ marginRight: 6 }} /> Refresh
        </Button>
    );
}