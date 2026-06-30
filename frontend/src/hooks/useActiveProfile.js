import { useQuery } from '@tanstack/react-query';
import { profileMasjidService } from '../services/baseCrudService';

export function useActiveProfile() {
  const { data: profiles = [], isLoading, isError } = useQuery({
    queryKey: ['profileMasjid'],
    queryFn: async () => await profileMasjidService.getAll(),
  });

  const activeProfile = profiles.find(p => p.is_active);

  return {
    activeProfile,
    isLoading,
    isError,
  };
}
