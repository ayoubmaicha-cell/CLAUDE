import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import Link from 'next/link';

interface DashboardStats {
  clients: { total: number; actifs: number };
  obligations: {
    total: number;
    enRetard: number;
    aFaire: number;
    enCours: number;
    deposees: number;
    payees: number;
    echeancesJ7: number;
    echeancesJ3: number;
  };
  factures: { impayees: number; revenus: number };
  dossiersJuridiques: number;
  clientsEnRetard: Array<{
    id: string;
    raisonSociale: string;
    _count: { obligations: number };
  }>;
  prochainesEcheances: Array<{
    id: string;
    dateEcheance: string;
    periode: string;
    obligation: { libelle: string; categorie: string };
    client: { id: string; raisonSociale: string };
  }>;
}

const statutColors: Record<string, string> = {
  A_FAIRE: 'bg-gray-100 text-gray-700',
  EN_COURS: 'bg-blue-100 text-blue-700',
  DEPOSE: 'bg-indigo-100 text-indigo-700',
  PAYE: 'bg-green-100 text-green-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  NON_APPLICABLE: 'bg-slate-100 text-slate-500',
};

const categorieIcon: Record<string, string> = {
  FISCALE: '🏛️',
  SOCIALE: '👥',
  JURIDIQUE: '⚖️',
  COMPTABLE: '📒',
};

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>('/stats/dashboard')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!stats) return <Layout><p className="text-red-500">Erreur de chargement</p></Layout>;

  const progressPct = stats.obligations.total
    ? Math.round((stats.obligations.payees / stats.obligations.total) * 100)
    : 0;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm">Vue d'ensemble du cabinet</p>
      </div>

      {/* Alertes critiques */}
      {(stats.obligations.enRetard > 0 || stats.obligations.echeancesJ3 > 0) && (
        <div className="mb-6 space-y-2">
          {stats.obligations.echeancesJ3 > 0 && (
            <div className="bg-orange-50 border border-orange-300 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-orange-500 text-xl">⚠️</span>
              <p className="text-orange-800 text-sm font-medium">
                {stats.obligations.echeancesJ3} obligation(s) à déposer dans les 3 prochains jours
              </p>
              <Link href="/obligations?filter=urgent" className="ml-auto text-orange-600 hover:underline text-sm font-bold">
                Voir →
              </Link>
            </div>
          )}
          {stats.obligations.enRetard > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-red-500 text-xl">🚨</span>
              <p className="text-red-800 text-sm font-medium">
                {stats.obligations.enRetard} obligation(s) en retard — action immédiate requise
              </p>
              <Link href="/obligations?statut=EN_RETARD" className="ml-auto text-red-600 hover:underline text-sm font-bold">
                Voir →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Clients actifs" value={stats.clients.actifs} sub={`/ ${stats.clients.total} total`} color="text-blue-600" />
        <StatCard label="Obligations en retard" value={stats.obligations.enRetard} sub="Nécessitent action" color={stats.obligations.enRetard > 0 ? 'text-red-600' : 'text-green-600'} />
        <StatCard label="Échéances J-7" value={stats.obligations.echeancesJ7} sub="Cette semaine" color="text-orange-500" />
        <StatCard label="Factures impayées" value={stats.factures.impayees} sub={`Revenus: ${stats.factures.revenus.toFixed(2)} MAD`} color="text-purple-600" />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="À faire" value={stats.obligations.aFaire} color="text-gray-700" />
        <StatCard label="En cours" value={stats.obligations.enCours} color="text-blue-600" />
        <StatCard label="Déposées" value={stats.obligations.deposees} color="text-indigo-600" />
        <StatCard label="Payées" value={stats.obligations.payees} color="text-green-600" />
      </div>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Taux de complétion des obligations</span>
          <span className="text-sm font-bold text-blue-600">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{stats.obligations.payees} payées sur {stats.obligations.total} total</p>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Prochaines échéances */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900">Prochaines échéances (7 jours)</h2>
            <Link href="/obligations" className="text-blue-600 text-sm hover:underline">Voir tout</Link>
          </div>
          {stats.prochainesEcheances.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Aucune échéance prochaine</p>
          ) : (
            <div className="space-y-3">
              {stats.prochainesEcheances.map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">{categorieIcon[e.obligation.categorie] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.obligation.libelle}</p>
                    <p className="text-xs text-gray-500 truncate">{e.client.raisonSociale} — {e.periode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-orange-600">
                      {new Date(e.dateEcheance).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clients en retard */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900">Clients avec obligations en retard</h2>
            <Link href="/clients" className="text-blue-600 text-sm hover:underline">Voir clients</Link>
          </div>
          {stats.clientsEnRetard.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <span className="text-4xl mb-2">✅</span>
              <p className="text-gray-500 text-sm">Aucun client en retard</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.clientsEnRetard.map((c) => (
                <Link key={c.id} href={`/clients/${c.id}`}>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.raisonSociale}</p>
                    </div>
                    <span className="badge bg-red-100 text-red-700">
                      {c._count.obligations} retard(s)
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Modules rapides */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Accès rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/clients/new', icon: '➕', label: 'Nouveau client', color: 'bg-blue-50 hover:bg-blue-100' },
              { href: '/obligations', icon: '📋', label: 'Calendrier fiscal', color: 'bg-indigo-50 hover:bg-indigo-100' },
              { href: '/juridical', icon: '⚖️', label: 'Dossiers juridiques', color: 'bg-purple-50 hover:bg-purple-100' },
              { href: '/invoices/new', icon: '💰', label: 'Nouvelle facture', color: 'bg-green-50 hover:bg-green-100' },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={`${item.color} rounded-lg p-4 text-center cursor-pointer transition-colors`}>
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Module juridique & facturation */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Résumé modules</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚖️</span>
                <div>
                  <p className="text-sm font-medium">Dossiers juridiques</p>
                  <p className="text-xs text-gray-500">En cours</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">{stats.dossiersJuridiques}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-sm font-medium">Revenus encaissés</p>
                  <p className="text-xs text-gray-500">Honoraires payés</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-600">
                {stats.factures.revenus.toLocaleString('fr-MA')} MAD
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <p className="text-sm font-medium">Factures à recouvrer</p>
                  <p className="text-xs text-gray-500">En attente ou retard</p>
                </div>
              </div>
              <span className={`text-2xl font-bold ${stats.factures.impayees > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {stats.factures.impayees}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
