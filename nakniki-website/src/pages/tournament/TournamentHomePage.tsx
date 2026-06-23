import { useParams, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { sendGet } from '../../services/api';
import { ENDPOINTS as E } from '../../constants/endpoints.constants';
import { ROUTES as R } from '../../constants/routes.constants';
import { useUser } from '../../services/UserContext';
import { TournamentStatus } from '@nakniki/shared';
import LoadingSpinner from '../../components/LoadingSpinner';
import { TournamentBracketPage } from './TournamentBracketPage';
import { TournamentRegisteringPage } from './TournamentRegisteringPage';
import { Flex, Text } from '@radix-ui/themes';

export default function TournamentHomePage() {

    const { id } = useParams<{ id: string }>();
    const { user } = useUser();
    const [details, setDetails] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    const fetchDetails = useCallback(async () => {
        try {
            const res = await sendGet(E.TOURNAMENTS.DETAILS(id!), user?.token);
            setDetails(res.data);
            setNotFound(false);
        }
        catch (e: any) {
            if (e?.response?.status === 404) {
                setNotFound(true);
            } else {
                setNotFound(false);
                setError(e?.response?.data?.error ?? 'Failed to load tournament.');
            }
        }
        finally {
            setIsLoading(false);
        }
    }, [id, user?.token]);

    useEffect(() => { if (id) fetchDetails(); }, [id, fetchDetails]);

    if (isLoading) return <LoadingSpinner/>;
    if (notFound)  return <Navigate to={R.NOT_FOUND} replace />;
    if (error || !details) {
    return (
        <Flex align="center" justify="center" style={{ height: '60vh' }}>
            <Text color="red" size="4">{error ?? 'Failed to load tournament.'}</Text>
        </Flex>
    );
}

    switch (details.tournament.status) {
        case TournamentStatus.REGISTERING:
            return <TournamentRegisteringPage details={details} refresh={fetchDetails} />;
        case TournamentStatus.IN_PROGRESS:
        case TournamentStatus.FINISHED:
            return  null // <TournamentBracketPage details={details} />; 
        case TournamentStatus.CANCELLED:
        default:
            return <Navigate to={R.NOT_FOUND} replace />;
    };
}