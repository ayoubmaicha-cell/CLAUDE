import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user data
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">TaxBox</h1>
            <div className="space-x-4">
              <span className="text-gray-700">{user?.firstName} {user?.lastName}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-bold mb-2">Total Clients</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-bold mb-2">Déclarations IS</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-bold mb-2">Déclarations IR</h3>
            <p className="text-3xl font-bold text-yellow-600">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-bold mb-2">Déclarations TVA</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/clients">
            <div className="bg-white p-8 rounded-lg shadow cursor-pointer hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">👥 Gérer les Clients</h3>
              <p className="text-gray-600">Ajouter, modifier ou supprimer des clients</p>
            </div>
          </Link>

          <Link href="/declarations">
            <div className="bg-white p-8 rounded-lg shadow cursor-pointer hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">📋 Déclarations Fiscales</h3>
              <p className="text-gray-600">Créer et gérer les déclarations IS, IR, TVA</p>
            </div>
          </Link>

          <Link href="/settings">
            <div className="bg-white p-8 rounded-lg shadow cursor-pointer hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">⚙️ Paramètres</h3>
              <p className="text-gray-600">Configurer votre cabinet et les utilisateurs</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
