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
  reference?: string;
  obligation: { libelle: string; categorie: string; code: string };
}

interface Invoice {
  id: string;
  numero: string;
  montant: number;
  totalTTC: number;
  statut: string;
  dateEmission: string;
  dateEcheance: string;
}

interface JuridicalFile {
  id: string;
  type: string;
  description?: string;
  statut: string;
  dateDepot?: string;
}

interface Client {
  id: string;
  raisonSociale: string;
  type: string;
  regimeFiscal: string;
  regimeTVA: string;
  status: string;
  if_number?: string;
  ice?: string;
  rc?: string;
  cnss?: string;
  patente?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  dateDebutActivite?: string;
  responsable?: { id: string; firstName: string; lastName: string };
  obligations: Obligation[];
  invoices: Invoice[];
  juridicalFiles: JuridicalFile[];
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

const invoiceColors: Record<string, string> = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  PAYE: 'bg-green-100 text-green-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  ANNULE: 'bg-gray-100 text-gray-500',
};

export default function ClientDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'obligations' | 'juridical' | 'invoices' | 'info'>('obligations');
  const [updatingObligation, setUpdatingObligation] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<{ client: Client }>(`/clients/${id}`)
      .then((d) => setClient(d.client))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const updateObligationStatus = async (obligId: string, statut: string) => {
    setUpdatingObligation(obligId);
    try {
      await api.patch(`/obligations/${obligId}`, { statut });
      const updated = await api.get<{ client: Client }>(`/clients/${id}`);
      setClient(updated.client);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingObligation(null);
    }
  };

  const generateObligations = async () => {
    if (!id) return;
    try {
      await api.post(`/obligations/generate/${id}`, { year: new Date().getFullYear() });
      const updated = await api.get<{ client: Client }>(`/clients/${id}`);
      setClient(updated.client);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Layout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div></Layout>;
  if (!client) return <Layout><p className="text-red-500">Client non trouvé</p></Layout>;

  const obligRetard = client.obligations.filter(o => o.statut === 'EN_RETARD').length;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm mb-2">
          ← Retour aux clients
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.raisonSociale}</h1>
            <div className="flex gap-2 mt-2">
              <span className={`badge ${client.status === 'ACTIF' ? 'bg-green-100 text-green-700' : client.status === 'SUSPENDU' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {client.status}
              </span>
              <span className="badge bg-blue-100 text-blue-700">{client.regimeFiscal}</span>
              {client.regimeTVA !== 'EXONERE' && (
                <span className="badge bg-orange-100 text-orange-700">TVA {client.regimeTVA}</span>
              )}
              {obligRetard > 0 && (
                <span className="badge bg-red-100 text-red-700">{obligRetard} en retard</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={generateObligations} className="btn-secondary text-sm">
              ↻ Régénérer obligations
            </button>
            <Link href={`/clients/${client.id}/edit`} className="btn-primary text-sm">
              Modifier
            </Link>
          </div>
        </div>
      </div>

      {/* Quick info bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'IF', value: client.if_number || '—' },
          { label: 'ICE', value: client.ice || '—' },
          { label: 'RC', value: client.rc || '—' },
          { label: 'CNSS', value: client.cnss || '—' },
        ].map((item) => (
          <div key={item.label} className="card py-3">
            <p className="text-xs text-gray-500 font-medium">{item.label}</p>
            <p className="text-sm font-mono font-semibold text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {([
          ['obligations', 'Obligations', client.obligations.length],
          ['juridical', 'Juridique', client.juridicalFiles.length],
          ['invoices', 'Facturation', client.invoices.length],
          ['info', 'Informations', null],
        ] as const).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {label} {count !== null && <span className="ml-1 text-xs">({count})</span>}
          </button>
        ))}
      </div>

      {/* Tab: Obligations */}
      {tab === 'obligations' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Obligation</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Période</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Échéance</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Montant</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {client.obligations.map((ob) => (
                <tr key={ob.id} className={`hover:bg-gray-50 ${ob.statut === 'EN_RETARD' ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{ob.obligation.libelle}</p>
                    <p className="text-xs text-gray-400">{ob.obligation.code}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ob.periode}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(ob.dateEcheance).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ob.montant ? `${ob.montant.toLocaleString('fr-MA')} MAD` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statutColors[ob.statut]}`}>
                      {statutLabels[ob.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={ob.statut}
                      disabled={updatingObligation === ob.id}
                      onChange={(e) => updateObligationStatus(ob.id, e.target.value)}
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

      {/* Tab: Juridical */}
      {tab === 'juridical' && (
        <div>
          <div className="flex justify-end mb-4">
            <Link href={`/juridical/new?clientId=${client.id}`} className="btn-primary text-sm">
              + Nouveau dossier
            </Link>
          </div>
          {client.juridicalFiles.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-4xl mb-2">⚖️</p>
              <p className="text-gray-500">Aucun dossier juridique</p>
            </div>
          ) : (
            <div className="space-y-3">
              {client.juridicalFiles.map((f) => (
                <div key={f.id} className="card">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{f.type.replace('_', ' ')}</p>
                      {f.description && <p className="text-sm text-gray-500 mt-1">{f.description}</p>}
                      {f.dateDepot && <p className="text-xs text-gray-400 mt-1">Déposé le: {new Date(f.dateDepot).toLocaleDateString('fr-FR')}</p>}
                    </div>
                    <span className={`badge ${f.statut === 'COMPLETE' ? 'bg-green-100 text-green-700' : f.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {f.statut.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Invoices */}
      {tab === 'invoices' && (
        <div>
          <div className="flex justify-end mb-4">
            <Link href={`/invoices/new?clientId=${client.id}`} className="btn-primary text-sm">
              + Nouvelle facture
            </Link>
          </div>
          {client.invoices.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-4xl mb-2">💰</p>
              <p className="text-gray-500">Aucune facture</p>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">N° Facture</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Date émission</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Échéance</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Montant TTC</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {client.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{inv.numero}</td>
                      <td className="px-4 py-3">{new Date(inv.dateEmission).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3">{new Date(inv.dateEcheance).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3 font-medium">{inv.totalTTC.toLocaleString('fr-MA')} MAD</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${invoiceColors[inv.statut] || 'bg-gray-100 text-gray-700'}`}>
                          {inv.statut.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Info */}
      {tab === 'info' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Informations générales</h3>
            <dl className="space-y-3">
              {[
                ['Type', client.type.replace('_', ' ')],
                ['Régime fiscal', client.regimeFiscal],
                ['Régime TVA', client.regimeTVA],
                ['Date début', client.dateDebutActivite ? new Date(client.dateDebutActivite).toLocaleDateString('fr-FR') : '—'],
                ['Responsable', client.responsable ? `${client.responsable.firstName} ${client.responsable.lastName}` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-sm text-gray-500">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-4">Coordonnées</h3>
            <dl className="space-y-3">
              {[
                ['Email', client.email || '—'],
                ['Téléphone', client.phone || '—'],
                ['Adresse', client.address || '—'],
                ['Ville', client.city || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-sm text-gray-500">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-4">Identifiants fiscaux</h3>
            <dl className="space-y-3">
              {[
                ['IF', client.if_number || '—'],
                ['ICE', client.ice || '—'],
                ['RC', client.rc || '—'],
                ['CNSS', client.cnss || '—'],
                ['Taxe Professionnelle', client.patente || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-sm text-gray-500">{k}</dt>
                  <dd className="text-sm font-mono text-xs font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </Layout>
  );
}
