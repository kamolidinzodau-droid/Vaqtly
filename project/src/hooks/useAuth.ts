import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import type { User } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => storage.getUser());

  useEffect(() => {
    storage.saveUser(user);
  }, [user]);

  const login = useCallback((u: User) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  return { user, login, logout };
}
