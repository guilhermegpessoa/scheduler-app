<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // RQF 1.1 - User List (same list for everyone)
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')->get();
        return response()->json($users, 200); // RQNF2: 200 OK
    }

    // RQF 1.2 - Adding Users (Administrators Only)
    public function store(Request $request)
    {
        if (Gate::denies('manage-users')) {
            return response()->json(['message' => 'Acesso negado. Apenas administradores podem incluir novos usuários.'], 403); // RQNF2: 403 Forbidden
        }

        // Strict validations for RQF 1.2 and RQNF4
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => ['required', Rule::in(['administrator', 'attendant'])],
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'password_confirmation' => 'required|same:password',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return response()->json($user, 201); // RQNF2: 201 Created
    }

    // RQF 1.3 - User Editing
    public function update(Request $request, $id)
    {
        $userToEdit = User::findOrFail($id);

        if (Gate::denies('update-user', $userToEdit)) {
            return response()->json(['message' => 'Acesso negado. Você só pode editar o seu próprio perfil.'], 403);
        }

        // RQF 1.3: Can edit the same fields, EXCEPT email and password
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => [
                $request->user()->role === 'administrator' ? 'required' : 'nullable', 
                Rule::in(['administrator', 'attendant'])
            ],
        ]);

        if ($request->user()->role === 'administrator' && $request->has('role')) {
            $userToEdit->role = $request->role;
        }
        
        $userToEdit->name = $request->name;
        $userToEdit->save();

        return response()->json($userToEdit, 200); // RQNF2: 200 OK
    }

    // RQF 1.1 - User Deletion (Administrators Only)
    public function destroy($id)
    {
        if (Gate::denies('manage-users')) {
            return response()->json(['message' => 'Acesso negado. Apenas administradores podem excluir usuários.'], 403);
        }

        $userToDelete = User::findOrFail($id);

        if (auth()->id() === $userToDelete->id) {
            return response()->json(['message' => 'Você não pode excluir o seu próprio usuário administrador.'], 400);
        }

        $userToDelete->delete();

        return response()->json(['message' => 'Usuário removido com sucesso.'], 200);
    }
}