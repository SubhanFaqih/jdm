import { useQuery } from "@tanstack/react-query";
import { hadistAcitveService } from "../services/baseCrudService";

export function useActiveHadist() {
    const { data: activeHadist = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['Hadist'],
        queryFn: async () => await hadistAcitveService.getAll(),
        refetchOnWindowFocus: false,
    })

    return {
        activeHadist, isLoading, isError, refetch
    }
}
