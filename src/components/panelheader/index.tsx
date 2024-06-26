import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../serveces/firebaseConection";

export function DashboardHeader() {
    async function handleLogout() {
        await signOut(auth)
    }
    return (
        <div className="w-full items-center flex h-14 bg-red-500 rounded-lg text-white font-medium gap-4 px-4 mb-4">
            <Link to="/dashboard">DashBoard</Link>
            <Link to="/dashboard/new">Novo carro</Link>
            <Link to="/register">Novo usuário</Link>
            <button className="ml-auto" onClick={handleLogout}>Sair</button>
        </div>
    )
}