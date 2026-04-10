import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import api from '../../lib/api';

export default function NewClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    raisonSociale: '',
    type: 'PERSONNE_MORALE',
    regimeFiscal: 'IS',
    regimeTVA: 'MENSUEL',
    if_number: '',
    ice: '',
    rc: '',
    cnss: '',
    patente: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    dateDebutActivite: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/clients', form);
      router.push('/clients');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm mb-2">
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau client</h1>
          <p className="text-gray-500 text-sm">Remplissez les informations du client</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identification */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Identification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Raison sociale / Nom *</label>
                <input name="raisonSociale" value={form.raisonSociale} onChange={handleChange} required className="input" placeholder="SARL ABC..." />
              </div>
              <div>
                <label className="label">Type *</label>
                <select name="type" value={form.type} onChange={handleChange} className="select">
                  <option value="PERSONNE_MORALE">Personne Morale</option>
                  <option value="PERSONNE_PHYSIQUE">Personne Physique</option>
                  <option value="ASSOCIATION">Association</option>
                  <option value="AUTO_ENTREPRENEUR">Auto-Entrepreneur</option>
                </select>
              </div>
              <div>
                <label className="label">Date début d'activité</label>
                <input name="dateDebutActivite" type="date" value={form.dateDebutActivite} onChange={handleChange} className="input" />
              </div>
            </div>
          </div>

          {/* Régimes fiscaux */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Régimes fiscaux</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Régime fiscal *</label>
                <select name="regimeFiscal" value={form.regimeFiscal} onChange={handleChange} className="select">
                  <option value="IS">IS — Impôt sur les Sociétés</option>
                  <option value="IR">IR — Impôt sur le Revenu</option>
                  <option value="CPU">CPU — Contribution Professionnelle Unique</option>
                </select>
              </div>
              <div>
                <label className="label">Régime TVA</label>
                <select name="regimeTVA" value={form.regimeTVA} onChange={handleChange} className="select">
                  <option value="MENSUEL">Mensuel</option>
                  <option value="TRIMESTRIEL">Trimestriel</option>
                  <option value="EXONERE">Exonéré</option>
                </select>
              </div>
            </div>
          </div>

          {/* Identifiants fiscaux */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Identifiants légaux & fiscaux</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Identifiant Fiscal (IF)</label>
                <input name="if_number" value={form.if_number} onChange={handleChange} className="input" placeholder="12345678" />
              </div>
              <div>
                <label className="label">ICE</label>
                <input name="ice" value={form.ice} onChange={handleChange} className="input" placeholder="000123456789012" />
              </div>
              <div>
                <label className="label">RC (Registre de Commerce)</label>
                <input name="rc" value={form.rc} onChange={handleChange} className="input" placeholder="RC 12345" />
              </div>
              <div>
                <label className="label">N° CNSS</label>
                <input name="cnss" value={form.cnss} onChange={handleChange} className="input" placeholder="1234567" />
              </div>
              <div>
                <label className="label">Taxe Professionnelle</label>
                <input name="patente" value={form.patente} onChange={handleChange} className="input" placeholder="TP 12345" />
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Coordonnées</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="contact@societe.ma" />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="+212 6xx xxx xxx" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Adresse</label>
                <input name="address" value={form.address} onChange={handleChange} className="input" placeholder="123 Avenue Hassan II..." />
              </div>
              <div>
                <label className="label">Ville</label>
                <input name="city" value={form.city} onChange={handleChange} className="input" placeholder="Casablanca" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => router.back()} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Création...' : 'Créer le client'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
