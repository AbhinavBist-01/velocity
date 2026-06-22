import { trpc } from "~/trpc/client";

export const useSignup = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: () => {
      void utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    createUserWithEmailAndPasswordAsync,
    createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useSignin = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: signInWithEmailAndPasswordAsync,
    mutate: signInWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.signInUserWithEmailAndPassword.useMutation({
    onSuccess: () => {
      void utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    signInWithEmailAndPasswordAsync,
    signInWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUser = () => {
  const {
    data: user,
    error,
    failureCount,
    isError,
    isFetching,
    isLoading,
    isSuccess,
    status,
  } = trpc.auth.getLoggedInUserInfo.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user,
    error,
    failureCount,
    isError,
    isFetching,
    isLoading,
    isSuccess,
    status,
  };
};

export const useLogout = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: logoutAsync,
    mutate: logout,
    error,
    status,
  } = trpc.auth.logout.useMutation({
    onSuccess: () => {
      void utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    logoutAsync,
    logout,
    error,
    status,
  };
};
