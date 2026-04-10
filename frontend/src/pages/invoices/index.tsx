import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import Link from 'next/link';

interface Invoice {
  id: string;
  numero: string;
  montant: number;
  totalTTC: number;
  tva: number;
  statut: string;
  dateEmission: string;
  dateEcheance: string;
  datePaiement?: string;
  description?: string;
  client: { id: string; raisonSociale: string };
}

const statutColors: Record<string, string> = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  PAYE: 'bg-green-100 text-green-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  ANNULE: 'bg-gray-100 text-gray-500',
};

const statutLabels: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  PAYE: 'Payé',
  EN_RETARD: 'En retard',
  ANNULE: 'Annulé',
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<{ id: string; raisonSociale: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    clientId: '',
    montant: '',
    tva: '0.20',
    dateEcheance: '',
    description: '',
  });

  const fetchInvoices = () => {
    const params = new URLSearchParams();
    if (statutFilter) params.set('statut', statutFilter);
    api.get<{ invoices: Invoice[] }>(`/invoices?${params}`)
      .then((d) => setInvoices(d.invoices))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
    api.get<{ clients: any[] }>('/clients')
      .then((d) => setClients(d.clients.map((c: any) => ({ id: c.id, raisonSociale: c.raisonSociale }))))
      .catch(() => {});
  }, [statutFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/invoices', { ...form, montant: parseFloat(form.montant), tva: parseFloat(form.tva) });
      setShowForm(false);
      setForm({ clientId: '', montant: '', tva: '0.20', dateEcheance: '', description: '' });
      fetchInvoices();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const markPaid = async (id: string) => {
    try {
      await api.patch(`/invoices/${id}`, { statut: 'PAYE', datePaiement: new Date().toISOString() });
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  const totalTTC = invoices.reduce((s, i) => s + i.totalTTC, 0);
  const totalPaye = invoices.filter(i => i.statut === 'PAYE').reduce((s, i) => s + i.totalTTC, 0);
  const totalImpaye = invoices.filter(i => ['EN_ATTENTE', 'EN_RETARD'].includes(i.statut)).reduce((s, i) => s + i.totalTTC, 0);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturation Cabinet</h1>
          <p className="text-gray-500 text-sm">{invoices.length} facture(s)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Nouvelle facture
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500">Total émis</p>
          <p className="text-2xl font-bold text-gray-900">{totalTTC.toLocaleString('fr-MA')} MAD</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Encaissé</p>
          <p className="text-2xl font-bold text-green-600">{totalPaye.toLocaleString('fr-MA')} MAD</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">À recouvrer</p>
          <p className={`text-2xl font-bold ${totalImpaye > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {totalImpaye.toLocaleString('fr-MA')} MAD
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['', 'Toutes'], ['EN_ATTENTE', 'En attente'], ['EN_RETARD', 'En retard'], ['PAYE', 'Payées'], ['ANNULE', 'Annulées']].map(([val, lab]) => (
          <button
            key={val}
            onClick={() => setStatutFilter(val)}
            className={`badge px-3 py-1 text-sm cursor-pointer border-2 ${statutFilter === val ? 'border-blue-500' : 'border-transparent'} ${statutColors[val] || 'bg-gray-100 text-gray-700'}`}
          >
            {lab}
          </button>
        ))}
      </div>

      {/* New invoice modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="font-bold text-lg mb-4">Nouvelle facture</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Client *</label>
                <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="select" required>
                  <option value="">Choisir un client...</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.raisonSociale}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Montant HT (MAD) *</label>
                  <input type="number" min="0" step="0.01" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="label">TVA</label>
                  <select value={form.tva} onChange={(e) => setForm({ ...form, tva: e.target.value })} className="select">
                    <option value="0">0% (exonéré)</option>
                    <option value="0.07">7%</option>
                    <option value="0.10">10%</option>
                    <option value="0.14">14%</option>
                    <option value="0.20">20%</option>
                  </select>
                </div>
              </div>
              {form.montant && (
                <p className="text-sm text-gray-600 bg-blue-50 rounded p-2">
                  Total TTC: <strong>{(parseFloat(form.montant) * (1 + parseFloat(form.tva))).toFixed(2)} MAD</strong>
                </p>
              )}
              <div>
                <label className="label">Date d'échéance *</label>
                <input type="date" value={form.dateEcheance} onChange={(e) => setForm({ ...form, dateEcheance: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Description / Prestation</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" placeholder="Honoraires de comptabilité..." />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                  {submitting ? 'Création...' : 'Créer la facture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : invoices.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-3">💰</p>
          <p className="text-gray-500">Aucune facture</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">N° Facture</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Montant TTC</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Échéance</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className={`hover:bg-gray-50 ${inv.statut === 'EN_RETARD' ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{inv.numero}</td>
                  <td className="px-4 py-3">
                    <Link href={`/clients/${inv.client.id}`} className="text-blue-600 hover:underline font-medium">
                      {inv.client.raisonSociale}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{inv.description || '—'}</td>
                  <td className="px-4 py-3 font-bold">{inv.totalTTC.toLocaleString('fr-MA')} MAD</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(inv.dateEcheance).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statutColors[inv.statut]}`}>{statutLabels[inv.statut]}</span>
                  </td>
                  <td className="px-4 py-3">
                    {['EN_ATTENTE', 'EN_RETARD'].includes(inv.statut) && (
                      <button
                        onClick={() => markPaid(inv.id)}
                        className="text-xs text-green-600 hover:underline font-medium"
                      >
                        Marquer payé
                      </button>
                    )}
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
