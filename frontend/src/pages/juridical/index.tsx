import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import Link from 'next/link';

interface JuridicalFile {
  id: string;
  type: string;
  description?: string;
  statut: string;
  dateDepot?: string;
  dateFinPrevue?: string;
  tribunal?: string;
  numero?: string;
  client: { id: string; raisonSociale: string };
}

const statutColors: Record<string, string> = {
  EN_COURS: 'bg-blue-100 text-blue-700',
  COMPLETE: 'bg-green-100 text-green-700',
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  ANNULE: 'bg-gray-100 text-gray-500',
};

const typeLabels: Record<string, string> = {
  CREATION_SOCIETE: 'Création de société',
  MODIFICATION: 'Modification',
  RADIATION: 'Radiation',
  DEPOT_TRIBUNAL: 'Dépôt tribunal',
  ANNONCE_LEGALE: 'Annonce légale',
  AUTRE: 'Autre',
};

const typeIcons: Record<string, string> = {
  CREATION_SOCIETE: '🏢',
  MODIFICATION: '✏️',
  RADIATION: '❌',
  DEPOT_TRIBUNAL: '⚖️',
  ANNONCE_LEGALE: '📰',
  AUTRE: '📄',
};

export default function Juridical() {
  const [files, setFiles] = useState<JuridicalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<{ id: string; raisonSociale: string }[]>([]);

  const [form, setForm] = useState({
    clientId: '',
    type: 'CREATION_SOCIETE',
    description: '',
    tribunal: '',
    numero: '',
    dateDepot: '',
    dateFinPrevue: '',
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (statutFilter) params.set('statut', statutFilter);

    api.get<{ files: JuridicalFile[] }>(`/juridical?${params}`)
      .then((d) => setFiles(d.files))
      .catch(console.error)
      .finally(() => setLoading(false));

    api.get<{ clients: any[] }>('/clients')
      .then((d) => setClients(d.clients.map((c: any) => ({ id: c.id, raisonSociale: c.raisonSociale }))))
      .catch(() => {});
  }, [statutFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/juridical', form);
      setShowForm(false);
      const d = await api.get<{ files: JuridicalFile[] }>('/juridical');
      setFiles(d.files);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatut = async (id: string, statut: string) => {
    try {
      await api.patch(`/juridical/${id}`, { statut });
      const d = await api.get<{ files: JuridicalFile[] }>('/juridical');
      setFiles(d.files);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Juridique</h1>
          <p className="text-gray-500 text-sm">{files.length} dossier(s)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Nouveau dossier
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['', 'Tous'], ['EN_COURS', 'En cours'], ['EN_ATTENTE', 'En attente'], ['COMPLETE', 'Complété'], ['ANNULE', 'Annulé']].map(([val, lab]) => (
          <button
            key={val}
            onClick={() => setStatutFilter(val)}
            className={`badge px-3 py-1 text-sm cursor-pointer border-2 ${statutFilter === val ? 'border-blue-500' : 'border-transparent'} ${statutColors[val] || 'bg-gray-100 text-gray-700'}`}
          >
            {lab}
          </button>
        ))}
      </div>

      {/* New file modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="font-bold text-lg mb-4">Nouveau dossier juridique</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Client *</label>
                <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="select" required>
                  <option value="">Choisir un client...</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.raisonSociale}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select">
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tribunal</label>
                  <input value={form.tribunal} onChange={(e) => setForm({ ...form, tribunal: e.target.value })} className="input" placeholder="Tribunal de commerce..." />
                </div>
                <div>
                  <label className="label">N° dossier</label>
                  <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">Date dépôt</label>
                  <input type="date" value={form.dateDepot} onChange={(e) => setForm({ ...form, dateDepot: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">Date fin prévue</label>
                  <input type="date" value={form.dateFinPrevue} onChange={(e) => setForm({ ...form, dateFinPrevue: e.target.value })} className="input" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
                <button type="submit" className="btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Files list */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : files.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-3">⚖️</p>
          <p className="text-gray-500">Aucun dossier juridique</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((f) => (
            <div key={f.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <span className="text-3xl">{typeIcons[f.type] || '📄'}</span>
                  <div>
                    <p className="font-semibold">{typeLabels[f.type] || f.type}</p>
                    <Link href={`/clients/${f.client.id}`} className="text-blue-600 hover:underline text-sm">
                      {f.client.raisonSociale}
                    </Link>
                    {f.description && <p className="text-sm text-gray-500 mt-1">{f.description}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      {f.tribunal && <span>📍 {f.tribunal}</span>}
                      {f.numero && <span>N° {f.numero}</span>}
                      {f.dateDepot && <span>Déposé: {new Date(f.dateDepot).toLocaleDateString('fr-FR')}</span>}
                      {f.dateFinPrevue && <span>Fin prévue: {new Date(f.dateFinPrevue).toLocaleDateString('fr-FR')}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${statutColors[f.statut] || 'bg-gray-100 text-gray-700'}`}>
                    {f.statut.replace('_', ' ')}
                  </span>
                  <select
                    value={f.statut}
                    onChange={(e) => updateStatut(f.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                  >
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="COMPLETE">Complété</option>
                    <option value="ANNULE">Annulé</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
