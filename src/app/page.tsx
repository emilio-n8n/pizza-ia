import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">PizzaCall Automation</h1>
          <nav>
            <a href="#features" className="mx-2 text-gray-600 hover:text-red-600">Fonctionnalités</a>
            <a href="#pricing" className="mx-2 text-gray-600 hover:text-red-600">Tarifs</a>
            <a href="#contact" className="mx-2 text-gray-600 hover:text-red-600">Contact</a>
          </nav>
          <button className="bg-red-600 text-white font-bold py-2 px-4 rounded-full hover:bg-red-700 transition duration-300">
            Demander une démo
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-extrabold mb-4">
          Libérez-vous du téléphone, concentrez-vous sur vos pizzas !
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Notre IA prend les commandes pour vous, 24/7, sans erreur et avec une touche personnelle.
        </p>
        <button className="bg-red-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-red-700 transition duration-300">
          Commencer l'automatisation
        </button>
        <div className="mt-12">
          <Image
            src="/images/hero-image.svg"
            alt="Illustration de l'automatisation des commandes"
            width={500}
            height={300}
            className="mx-auto"
          />
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-12">
            Une solution pensée pour les pizzerias
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card bg-gray-100 p-6 rounded-lg shadow-lg text-center">
              <h4 className="text-xl font-bold mb-2">Gain de temps massif</h4>
              <p>Notre IA gère 100% des appels de commande, vous laissant libre de préparer vos délicieuses pizzas.</p>
            </div>
            <div className="feature-card bg-gray-100 p-6 rounded-lg shadow-lg text-center">
              <h4 className="text-xl font-bold mb-2">Zéro erreur de commande</h4>
              <p>Fini les erreurs de saisie. Chaque commande est prise avec précision et confirmée au client.</p>
            </div>
            <div className="feature-card bg-gray-100 p-6 rounded-lg shadow-lg text-center">
              <h4 className="text-xl font-bold mb-2">Personnalisation avancée</h4>
              <p>Configurez vos menus, offres spéciales, zones de livraison et plus encore pour une expérience unique.</p>
            </div>
            <div className="feature-card bg-gray-100 p-6 rounded-lg shadow-lg text-center">
              <h4 className="text-xl font-bold mb-2">Intégration simple</h4>
              <p>Aucun matériel requis. Notre service s'intègre à votre ligne téléphonique existante en quelques clics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} PizzaCall Automation. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}