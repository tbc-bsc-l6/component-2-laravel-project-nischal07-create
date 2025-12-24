<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::with('role')->get();
        $roles = UserRole::all();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function createTeacher()
    {
        return Inertia::render('admin/users/create-teacher');
    }

    public function storeTeacher(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);
        // Ensure teacher role exists
        $teacherRole = UserRole::firstOrCreate(
            ['name' => 'teacher'],
            ['display_name' => 'Teacher']
        );

        try {
            User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'user_role_id' => $teacherRole->id,
                'email_verified_at' => now(),
            ]);

            return redirect()->route('admin.users.index')
                ->with('success', 'Teacher created successfully.');
        } catch (\Exception $e) {
            report($e);
            return back()->withErrors(['error' => 'Failed to create teacher. Please try again.']);
        }
    }

    public function changeRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'user_role_id' => 'required|exists:user_roles,id',
        ]);

        // Prevent changing admin's own role
        if ($user->id === auth()->id() && auth()->user()->isAdmin()) {
            return back()->withErrors(['error' => 'You cannot change your own role.']);
        }

        $user->update(['user_role_id' => $validated['user_role_id']]);

        return back()->with('success', 'User role updated successfully.');
    }

    public function destroy(User $user)
    {
        // Prevent deleting own account
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        // Prevent deleting admin users
        if ($user->isAdmin()) {
            return back()->withErrors(['error' => 'Cannot delete admin users.']);
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}
