import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  Edit, 
  Trash2,
  Eye,
  UserPlus,
  Ban,
  CheckCircle,
  XCircle,
  Shield,
  User,
  Crown,
  Store
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User as UserType } from "@shared/schema";

const updateUserSchema = z.object({
  firstName: z.string().min(1, "Nama depan harus diisi"),
  lastName: z.string().min(1, "Nama belakang harus diisi"),
  email: z.string().email("Email tidak valid"),
  role: z.enum(["customer", "admin", "moderator", "seller"]),
  status: z.enum(["active", "inactive", "suspended", "banned"]),
});

const createUserSchema = z.object({
  firstName: z.string().min(1, "Nama depan harus diisi"),
  lastName: z.string().min(1, "Nama belakang harus diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["customer", "admin", "moderator", "seller"]),
  status: z.enum(["active", "inactive", "suspended", "banned"]),
  phoneNumber: z.string().optional(),
});

type UpdateUser = z.infer<typeof updateUserSchema>;
type CreateUser = z.infer<typeof createUserSchema>;

export default function UserManagement() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Redirect if not admin
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  if (!user?.isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
        <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      </div>
    </div>;
  }

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UpdateUser> }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Berhasil",
        description: "Data pengguna berhasil diperbarui",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Berhasil",
        description: "Pengguna berhasil dihapus",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUser) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Berhasil",
        description: "Pengguna berhasil ditambahkan",
      });
      setIsCreateDialogOpen(false);
      resetCreate();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
  });

  const { register: registerCreate, handleSubmit: handleSubmitCreate, setValue: setValueCreate, watch: watchCreate, reset: resetCreate } = useForm<CreateUser>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "customer",
      status: "active",
    },
  });

  const onEditUser = (user: UserType) => {
    setSelectedUser(user);
    setValue("firstName", user.firstName || "");
    setValue("lastName", user.lastName || "");
    setValue("email", user.email);
    setValue("role", user.role as any);
    setValue("status", user.status as any);
    setIsEditDialogOpen(true);
  };

  const onSubmitEdit = (data: UpdateUser) => {
    if (!selectedUser) return;
    updateUserMutation.mutate({ id: selectedUser.id, data });
  };

  const onSubmitCreate = (data: CreateUser) => {
    createUserMutation.mutate(data);
  };

  const onDeleteUser = (id: number) => {
    deleteUserMutation.mutate(id);
  };

  const onUpdateStatus = (id: number, status: string) => {
    updateUserMutation.mutate({ id, data: { status: status as any } });
  };

  const onUpdateRole = (id: number, role: string) => {
    updateUserMutation.mutate({ id, data: { role: role as any } });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="h-4 w-4" />;
      case "moderator": return <Shield className="h-4 w-4" />;
      case "seller": return <Store className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "moderator": return "secondary";
      case "seller": return "outline";
      default: return "default";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "suspended": return "destructive";
      case "banned": return "destructive";
      default: return "secondary";
    }
  };

  if (usersLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-2 sm:px-4 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">Manajemen Pengguna</h1>
          <p className="text-gray-600 text-sm sm:text-base">Kelola semua pengguna, role, dan status akun</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto flex-shrink-0">
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Pengguna
          </CardTitle>
          <CardDescription>
            Total {users.length} pengguna terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Pengguna</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[120px]">Role</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[140px] hidden md:table-cell">Terakhir Login</TableHead>
                  <TableHead className="min-w-[140px] hidden lg:table-cell">Tanggal Daftar</TableHead>
                  <TableHead className="text-right min-w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userData: UserType) => (
                  <TableRow key={userData.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {userData.firstName?.charAt(0) || userData.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {userData.firstName && userData.lastName 
                              ? `${userData.firstName} ${userData.lastName}`
                              : "Tidak ada nama"
                            }
                          </div>
                          <div className="text-sm text-gray-500">ID: {userData.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>
                      <Select 
                        value={userData.role} 
                        onValueChange={(value) => onUpdateRole(userData.id, value)}
                        disabled={userData.id === user?.id} // Tidak bisa mengubah role sendiri
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge variant={getRoleBadgeVariant(userData.role)} className="flex items-center gap-1">
                              {getRoleIcon(userData.role)}
                              {userData.role}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Customer
                            </div>
                          </SelectItem>
                          <SelectItem value="seller">
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4" />
                              Seller
                            </div>
                          </SelectItem>
                          <SelectItem value="moderator">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Moderator
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4" />
                              Admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={userData.status} 
                        onValueChange={(value) => onUpdateStatus(userData.id, value)}
                        disabled={userData.id === user?.id} // Tidak bisa mengubah status sendiri
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue>
                            <Badge variant={getStatusBadgeVariant(userData.status)}>
                              {userData.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Active
                            </div>
                          </SelectItem>
                          <SelectItem value="inactive">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-gray-500" />
                              Inactive
                            </div>
                          </SelectItem>
                          <SelectItem value="suspended">
                            <div className="flex items-center gap-2">
                              <Ban className="h-4 w-4 text-yellow-500" />
                              Suspended
                            </div>
                          </SelectItem>
                          <SelectItem value="banned">
                            <div className="flex items-center gap-2">
                              <Ban className="h-4 w-4 text-red-500" />
                              Banned
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 hidden md:table-cell">
                      {userData.lastLoginAt 
                        ? new Date(userData.lastLoginAt as unknown as string).toLocaleDateString('id-ID')
                        : "Belum pernah login"
                      }
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(userData.createdAt as unknown as string).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditUser(userData)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {userData.id !== user?.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus pengguna {userData.email}? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteUser(userData.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              Ubah informasi pengguna di bawah ini
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nama Depan</Label>
                <Input id="firstName" {...register("firstName")} />
              </div>
              <div>
                <Label htmlFor="lastName">Nama Belakang</Label>
                <Input id="lastName" {...register("lastName")} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={watch("role")} onValueChange={(value) => setValue("role", value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={watch("status")} onValueChange={(value) => setValue("status", value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>
              Buat akun pengguna baru dengan informasi di bawah ini
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="createFirstName">Nama Depan</Label>
                <Input id="createFirstName" {...registerCreate("firstName")} />
              </div>
              <div>
                <Label htmlFor="createLastName">Nama Belakang</Label>
                <Input id="createLastName" {...registerCreate("lastName")} />
              </div>
            </div>
            <div>
              <Label htmlFor="createEmail">Email</Label>
              <Input id="createEmail" type="email" {...registerCreate("email")} />
            </div>
            <div>
              <Label htmlFor="createPassword">Password</Label>
              <Input id="createPassword" type="password" {...registerCreate("password")} />
            </div>
            <div>
              <Label htmlFor="createPhoneNumber">Nomor Telepon (Opsional)</Label>
              <Input id="createPhoneNumber" {...registerCreate("phoneNumber")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="createRole">Role</Label>
                <Select value={watchCreate("role")} onValueChange={(value) => setValueCreate("role", value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="createStatus">Status</Label>
                <Select value={watchCreate("status")} onValueChange={(value) => setValueCreate("status", value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Membuat..." : "Buat Pengguna"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}