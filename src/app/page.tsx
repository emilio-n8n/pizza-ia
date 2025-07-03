import { Bot, Pizza, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-light-white text-custom-grey">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot size={28} className="text-accent-red" />
            <span className="font-bold text-xl text-custom-grey">PizzaAI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-custom-grey hover:text-accent-red transition-colors">
              Fonctionnalités
            </a>
            <a href="#pricing" className="text-custom-grey hover:text-accent-red transition-colors">
              Tarifs
            </a>
          </nav>
          <Link href="/auth/signup">
            <button className="bg-accent-red text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md">
              Demander une démo
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-custom-grey tracking-tight mb-4">
          Votre pizzeria,
          <br />
          <span className="text-accent-yellow">entièrement</span>
          <span className="text-accent-red"> auto</span>
          <span className="text-dark-green">matisée</span>
        </h1>
        <p className="text-lg text-custom-grey/80 max-w-2xl mx-auto mb-10">
          Notre IA prend les commandes pour vous, 24/7, sans erreur et avec une touche personnelle. Libérez-vous du téléphone, concentrez-vous sur vos pizzas !
        </p>
        <Link href="/auth/signup">
          <button className="bg-accent-yellow text-custom-grey font-bold py-4 px-10 rounded-lg text-lg hover:bg-yellow-500 transform hover:scale-105 transition-all duration-300 shadow-xl">
            Commencer l&apos;automatisation
          </button>
        </Link>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-accent-red">Une solution pensée pour les pizzerias</h2>
            <p className="text-lg text-custom-grey/80 mt-2">Tout ce dont vous avez besoin pour optimiser votre temps.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Bot size={32} />, title: "Gain de temps massif", description: "Notre IA gère 100% des appels de commande, vous laissant libre de préparer vos délicieuses pizzas." },
              { icon: <Zap size={32} />, title: "Zéro erreur de commande", description: "Fini les erreurs de saisie. Chaque commande est prise avec précision et confirmée au client." },
              { icon: <Pizza size={32} />, title: "Personnalisation avancée", description: "Configurez menus, offres, zones de livraison et plus pour une expérience unique." },
            ].map((feature, i) => (
              <div key={i} className="bg-light-white p-8 rounded-2xl shadow-xl text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
                <div className="text-accent-yellow mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-dark-green mb-3">{feature.title}</h3>
                <p className="text-custom-grey/90">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-custom-grey text-light-white py-12">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} PizzaAI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
