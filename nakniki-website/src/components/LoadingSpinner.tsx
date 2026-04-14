import { Flex, Spinner } from '@radix-ui/themes';

export default function LoadingSpinner() {
    return (
        <Flex
            align="center"
            justify="center"
            style={{
                height: '100vh',
                width: '100vw',
                backgroundColor: '#050505',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999
            }}
        >
            <Spinner size="3" style={{ color: 'var(--red-9)' }} />
        </Flex>
    );
}