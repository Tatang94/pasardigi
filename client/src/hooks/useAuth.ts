import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, RegisterUser, LoginUser } from "@shared/schema";

export function useAuth() {
  const { toast } = useToast();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginUser) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login berhasil",
        description: "Selamat datang kembali!",
      });
      
      // Immediate redirect without delay
      console.log("Login success, user:", user);
      
      if (user.isAdmin) {
        console.log("Admin user - redirecting to /admin");
        // Force immediate redirect for admin
        window.location.replace("/admin");
      } else {
        console.log("Regular user - redirecting to /");
        window.location.replace("/");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Pendaftaran berhasil",
        description: "Akun Anda telah dibuat!",
      });
      
      // Redirect to home after registration
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Pendaftaran gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout berhasil",
        description: "Sampai jumpa lagi!",
      });
      // Redirect to login page
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}
