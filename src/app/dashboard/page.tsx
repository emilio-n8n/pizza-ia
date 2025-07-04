import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Tableau de bord</h1>
        <p className="text-gray-600 mb-10">Bienvenue sur votre espace de gestion. Commencez par configurer votre pizzeria, puis ajoutez votre menu.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card for Pizzeria Profile */}
          <Link href="/dashboard/pizzeria-profile" className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Étape 1: Profil de la Pizzeria</h2>
            <p className="text-gray-700">
              Ajoutez ou modifiez les informations de votre établissement, comme le nom, l&apos;adresse et le numéro de téléphone.
            </p>
          </Link>

          {/* Card for Uploading Menu */}
          <Link href="/dashboard/upload-menu" className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Étape 2: Analyser votre Menu</h2>
            <p className="text-gray-700">
              Téléversez une image de votre menu et laissez notre IA l&apos;analyser pour l&apos;intégrer à votre agent conversationnel.
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
}