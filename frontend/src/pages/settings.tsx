import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  cabinet: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
  };
}

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<'profil' | 'cabinet' | 'obligations'>('profil');
  const [refs, setRefs] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  useEffect(() => {
    api.get<{ user: User }>('/auth/me').then((d) => setUser(d.user)).catch(console.error);
  }, []);

  const loadRefs = () => {
    setLoadingRefs(true);
    api.get<{ refs: any[] }>('/obligations/refs')
      .then((d) => setRefs(d.refs))
      .catch(console.error)
      .finally(() => setLoadingRefs(false));
  };

  useEffect(() => {
    if (tab === 'obligations') loadRefs();
  }, [tab]);

  const categorieColors: Record<string, string> = {
    FISCALE: 'bg-blue-100 text-blue-700',
    SOCIALE: 'bg-orange-100 text-orange-700',
    JURIDIQUE: 'bg-purple-100 text-purple-700',
    COMPTABLE: 'bg-teal-100 text-teal-700',
  };

  const periodiciteColors: Record<string, string> = {
    MENSUELLE: 'bg-red-100 text-red-700',
    TRIMESTRIELLE: 'bg-yellow-100 text-yellow-700',
    ANNUELLE: 'bg-green-100 text-green-700',
    PONCTUELLE: 'bg-gray-100 text-gray-700',
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm">Configuration du cabinet</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {([
          ['profil', 'Mon profil'],
          ['cabinet', 'Cabinet'],
          ['obligations', 'Référentiel obligations'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Profil tab */}
      {tab === 'profil' && user && (
        <div className="max-w-lg">
          <div className="card">
            <h2 className="font-semibold mb-4">Informations personnelles</h2>
            <dl className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <dt className="text-sm text-gray-500">Prénom</dt>
                <dd className="text-sm font-medium">{user.firstName}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <dt className="text-sm text-gray-500">Nom</dt>
                <dd className="text-sm font-medium">{user.lastName}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium">{user.email}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-sm text-gray-500">Rôle</dt>
                <dd>
                  <span className={`badge ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Cabinet tab */}
      {tab === 'cabinet' && user && (
        <div className="max-w-lg">
          <div className="card">
            <h2 className="font-semibold mb-4">Informations du cabinet</h2>
            <dl className="space-y-4">
              {[
                ['Nom du cabinet', user.cabinet?.name],
                ['Email', user.cabinet?.email],
                ['Téléphone', user.cabinet?.phone || '—'],
                ['Adresse', user.cabinet?.address || '—'],
                ['Ville', user.cabinet?.city || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <dt className="text-sm text-gray-500">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* Obligations référentiel tab */}
      {tab === 'obligations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">Obligations fiscales, sociales et juridiques configurées</p>
          </div>
          {loadingRefs ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Code</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Libellé</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Catégorie</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Périodicité</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Régimes</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Échéance</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Base légale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {refs.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.code}</td>
                      <td className="px-4 py-3 font-medium">{r.libelle}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${categorieColors[r.categorie] || 'bg-gray-100 text-gray-700'}`}>
                          {r.categorie}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${periodiciteColors[r.periodicite] || 'bg-gray-100 text-gray-700'}`}>
                          {r.periodicite}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{r.regimesCibles.join(', ')}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{r.regleEcheance}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{r.baseLegale || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
