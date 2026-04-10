import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import Link from 'next/link';

interface Obligation {
  id: string;
  periode: string;
  dateEcheance: string;
  statut: string;
  montant?: number;
  joursRetard: number;
  obligation: { libelle: string; categorie: string; code: string };
  client: { id: string; raisonSociale: string; type: string };
  responsable?: { firstName: string; lastName: string };
}

const statutColors: Record<string, string> = {
  A_FAIRE: 'bg-gray-100 text-gray-700',
  EN_COURS: 'bg-blue-100 text-blue-700',
  DEPOSE: 'bg-indigo-100 text-indigo-700',
  PAYE: 'bg-green-100 text-green-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  NON_APPLICABLE: 'bg-slate-100 text-slate-500',
};

const statutLabels: Record<string, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  DEPOSE: 'Déposé',
  PAYE: 'Payé',
  EN_RETARD: 'En retard',
  NON_APPLICABLE: 'N/A',
};

const categorieIcon: Record<string, string> = {
  FISCALE: '🏛️',
  SOCIALE: '👥',
  JURIDIQUE: '⚖️',
  COMPTABLE: '📒',
};

export default function Obligations() {
  const router = useRouter();
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState((router.query.statut as string) || '');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchObligations = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statutFilter) params.set('statut', statutFilter);

    api.get<{ obligations: Obligation[] }>(`/obligations?${params}`)
      .then((d) => setObligations(d.obligations))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchObligations(); }, [statutFilter]);

  const updateStatus = async (id: string, statut: string) => {
    setUpdating(id);
    try {
      await api.patch(`/obligations/${id}`, { statut });
      fetchObligations();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const retardCount = obligations.filter(o => o.statut === 'EN_RETARD').length;
  const aFaireCount = obligations.filter(o => o.statut === 'A_FAIRE').length;

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Obligations fiscales & sociales</h1>
          <p className="text-gray-500 text-sm">{obligations.length} obligation(s)</p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap mb-6">
        {[
          { label: 'Tout', value: '', count: null, color: 'bg-gray-100 text-gray-700' },
          { label: 'À faire', value: 'A_FAIRE', count: aFaireCount, color: 'bg-gray-100 text-gray-700' },
          { label: 'En cours', value: 'EN_COURS', count: null, color: 'bg-blue-100 text-blue-700' },
          { label: 'Déposé', value: 'DEPOSE', count: null, color: 'bg-indigo-100 text-indigo-700' },
          { label: 'Payé', value: 'PAYE', count: null, color: 'bg-green-100 text-green-700' },
          { label: 'En retard', value: 'EN_RETARD', count: retardCount, color: 'bg-red-100 text-red-700' },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setStatutFilter(s.value)}
            className={`badge cursor-pointer px-3 py-1 text-sm font-medium border-2 ${
              statutFilter === s.value ? 'border-blue-500' : 'border-transparent'
            } ${s.color}`}
          >
            {s.label} {s.count !== null && s.count > 0 && `(${s.count})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : obligations.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-3">📋</p>
          <p className="text-gray-500">Aucune obligation trouvée</p>
          <p className="text-gray-400 text-sm mt-1">Créez des clients pour générer des obligations automatiquement</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Obligation</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Période</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Échéance</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Retard</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {obligations.map((ob) => (
                <tr
                  key={ob.id}
                  className={`hover:bg-gray-50 transition-colors ${ob.statut === 'EN_RETARD' ? 'bg-red-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{categorieIcon[ob.obligation.categorie] || '📋'}</span>
                      <div>
                        <p className="font-medium">{ob.obligation.libelle}</p>
                        <p className="text-xs text-gray-400">{ob.obligation.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/clients/${ob.client.id}`} className="text-blue-600 hover:underline font-medium">
                      {ob.client.raisonSociale}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ob.periode}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(ob.dateEcheance).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    {ob.joursRetard > 0 && (
                      <span className="text-red-600 font-bold text-xs">+{ob.joursRetard}j</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statutColors[ob.statut]}`}>
                      {statutLabels[ob.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={ob.statut}
                      disabled={updating === ob.id}
                      onChange={(e) => updateStatus(ob.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                    >
                      <option value="A_FAIRE">À faire</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="DEPOSE">Déposé</option>
                      <option value="PAYE">Payé</option>
                      <option value="NON_APPLICABLE">N/A</option>
                    </select>
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
