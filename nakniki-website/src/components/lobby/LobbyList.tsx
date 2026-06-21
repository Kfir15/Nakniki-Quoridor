import { Flex, Box, Text, Badge, Button, Card, Separator, Spinner } from '@radix-ui/themes';
import { RefreshCcw, Users, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type LobbyListProps<T> = {
    items: T[];
    isRefreshing: boolean;
    onRefresh: () => void;
    title: string;
    emptyTitle: string;
    emptyText: string;
    loadingText: string;
    renderItem: (item: T, index: number) => React.ReactNode;
};

export function LobbyList<T>({
    items, isRefreshing, onRefresh, title, emptyTitle, emptyText, loadingText, renderItem }: 
    LobbyListProps<T>) {
    return (
        <Flex direction="column" style={{ gridColumn: 'span 8', height: '100%', overflow: 'hidden', minHeight: 0 }}>
            {/* active list */}
                <Box style={{ flexShrink: 0 }}>
                    <Flex justify="between" align="center" mb="4">
                        <Flex align="center" gap="3">
                            <Text size="5" weight="bold">{title}</Text>
                            <Badge color="green" variant="soft" radius="full">
                                <Users size={12} style={{ marginRight: '4px' }} />
                                {items.length} Open
                            </Badge>
                        </Flex>
                        <Button variant="ghost" color="gray" onClick={onRefresh} disabled={isRefreshing} style={{ cursor: 'pointer' }}>
                            <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
                            Refresh List
                        </Button>
                    </Flex>
                    <Separator size="4" mb="4" style={{ opacity: 0.2 }} />
                </Box>


            <Flex direction="column" gap="3" style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '12px', paddingBottom: '12px' }}>
                <AnimatePresence mode="popLayout">
                    {isRefreshing && items.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Flex justify="center" align="center" p="9" direction="column" gap="4">
                                <Spinner size="3" />
                                <Text color="gray">{loadingText}</Text>
                            </Flex>
                        </motion.div>
                    ) : items.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Card style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <Globe size={40} color="gray" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                                <Text weight="bold" size="4" style={{ display: 'block', marginBottom: '8px' }}>
                                    {emptyTitle}
                                </Text>
                                <Text color="gray" size="2">
                                    {emptyText}
                                </Text>
                            </Card>
                        </motion.div>
                    ) : (
                        items.map((item, i) => (
                            renderItem(item, i)
                        ))
                    )}
                </AnimatePresence>
            </Flex>
        </Flex>
    );
}