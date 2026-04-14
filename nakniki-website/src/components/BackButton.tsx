import { IconButton, Tooltip, Box } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
    onClick?: () => void;
}

const BackButton = ({ onClick }: BackButtonProps) => {
    const navigate = useNavigate();
    const handleClick = onClick || (() => navigate(-1));

    return (
        <Box
            style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                zIndex: 10
            }}
        >
            {/* go back icon */}
            <Tooltip content={'Go back'}>
                <IconButton
                    variant="ghost"
                    size="3"
                    onClick={handleClick}
                    style={{
                        cursor: 'pointer',
                        color: 'white'
                    }}
                >
                    <ArrowLeftIcon width="24" height="24" />
                </IconButton>
            </Tooltip>
        </Box>
    );
}

export default BackButton;