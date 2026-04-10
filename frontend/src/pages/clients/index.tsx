import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import Link from 'next/link';

interface Client {
  id: string;
  raisonSociale: string;
  type: string;
  regimeFiscal: string;
  regimeTVA: string;
  status: string;
  city?: string;
  if_number?: string;
  ice?: string;
  responsable?: { firstName: string; lastName: string };
  _count: { obligations: number };
}

const statusColors: Record<string, string> = {
  ACTIF: 'bg-green-100 text-green-700',
  SUSPENDU: 'bg-yellow-100 text-yellow-700',
  RESILIE: 'bg-red-100 text-red-700',
};

const typeLabels: Record<string, string> = {
  PERSONNE_MORALE: 'Pers. Morale',
  PERSONNE_PHYSIQUE: 'Pers. Physique',
  ASSOCIATION: 'Association',
  AUTO_ENTREPRENEUR: 'Auto-Entr.',
};

const regimeColors: Record<string, string> = {
  IS: 'bg-blue-100 text-blue-700',
  IR: 'bg-purple-100 text-purple-700',
  CPU: 'bg-teal-100 text-teal-700',
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regimeFilter, setRegimeFilter] = useState('');

  const fetchClients = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (regimeFilter) params.set('regimeFiscal', regimeFilter);

    api.get<{ clients: Client[] }>(`/clients?${params}`)
      .then((d) => setClients(d.clients))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, [search, statusFilter, regimeFilter]);

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm">{clients.length} client(s) trouvé(s)</p>
        </div>
        <Link href="/clients/new" className="btn-primary">
          + Nouveau client
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Rechercher par nom, IF, ICE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select">
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="SUSPENDU">Suspendu</option>
            <option value="RESILIE">Résilié</option>
          </select>
          <select value={regimeFilter} onChange={(e) => setRegimeFilter(e.target.value)} className="select">
            <option value="">Tous les régimes</option>
            <option value="IS">IS</option>
            <option value="IR">IR</option>
            <option value="CPU">CPU</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : clients.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-3">👥</p>
          <p className="text-gray-500 mb-4">Aucun client trouvé</p>
          <Link href="/clients/new" className="btn-primary inline-block">Ajouter un client</Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Raison sociale</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Régime</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">IF / ICE</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Ville</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Responsable</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c.id}`} className="font-medium text-blue-600 hover:underline">
                      {c.raisonSociale}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{typeLabels[c.type] || c.type}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${regimeColors[c.regimeFiscal] || 'bg-gray-100 text-gray-700'}`}>
                      {c.regimeFiscal}
                    </span>
                    {c.regimeTVA !== 'EXONERE' && (
                      <span className="badge bg-orange-100 text-orange-700 ml-1">TVA-{c.regimeTVA === 'MENSUEL' ? 'M' : 'T'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {c.if_number || '—'} {c.ice && `/ ${c.ice}`}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.city || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.responsable ? `${c.responsable.firstName} ${c.responsable.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColors[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c.id}`} className="text-blue-600 hover:underline text-xs">
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
