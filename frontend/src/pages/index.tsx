import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">TaxBox</h1>
            <div className="space-x-4">
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Connexion
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Gestion Fiscale Simplifiée
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            La solution complète pour gérer les déclarations fiscales de votre cabinet comptable marocain
          </p>

          <div className="grid md:grid-cols-3 gap-8 my-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">📋 Déclarations Fiscales</h3>
              <p className="text-gray-600">
                Gérez IS, IR, TVA avec des formulaires intelligents et des calculs automatiques
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">📊 Rapports & Statistiques</h3>
              <p className="text-gray-600">
                Générez des rapports PDF et suivez vos déclarations en temps réel
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">👥 Gestion d'Équipe</h3>
              <p className="text-gray-600">
                Gérez vos utilisateurs avec des rôles et permissions granulaires
              </p>
            </div>
          </div>

          <Link href="/register" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-700">
            Commencer Maintenant
          </Link>
        </div>
      </main>
    </div>
  );
}
