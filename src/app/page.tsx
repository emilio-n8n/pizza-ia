import { Bot, Pizza, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-light-white text-custom-grey">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot size={28} className="text-pizza-red" />
            <span className="font-bold text-xl text-foreground">PizzaAI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground hover:text-pizza-red transition-colors">
              Fonctionnalités
            </a>
            <a href="#pricing" className="text-foreground hover:text-pizza-red transition-colors">
              Tarifs
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <button className="bg-secondary text-secondary-foreground font-bold py-2 px-6 rounded-lg hover:bg-secondary/80 transition-all duration-300 shadow-md border border-border">
                Se connecter
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="bg-pizza-red text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md">
                Demander une démo
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-24 text-center bg-background">
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
          Votre pizzeria,
          <br />
          <span className="text-pizza-yellow">entièrement</span>
          <span className="text-pizza-red"> auto</span>
          <span className="text-pizza-green">matisée</span>
        </h1>
        <p className="text-xl text-foreground/70 max-w-3xl mx-auto mb-12 leading-relaxed">
          Notre IA prend les commandes pour vous, 24/7, sans erreur et avec une touche personnelle. Libérez-vous du téléphone, concentrez-vous sur vos pizzas !
        </p>
        <Link href="/auth/signup">
          <button className="bg-pizza-yellow text-pizza-dark font-bold py-4 px-10 rounded-lg text-lg hover:bg-pizza-yellow/80 transform hover:scale-105 transition-all duration-300 shadow-xl">
            Commencer l&apos;automatisation
          </button>
        </Link>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-card py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-pizza-red">Une solution pensée pour les pizzerias</h2>
            <p className="text-lg text-foreground/80 mt-2">Tout ce dont vous avez besoin pour optimiser votre temps.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Bot size={32} />, title: "Gain de temps massif", description: "Notre IA gère 100% des appels de commande, vous laissant libre de préparer vos délicieuses pizzas." },
              { icon: <Zap size={32} />, title: "Zéro erreur de commande", description: "Fini les erreurs de saisie. Chaque commande est prise avec précision et confirmée au client." },
              { icon: <Pizza size={32} />, title: "Personnalisation avancée", description: "Configurez menus, offres, zones de livraison et plus pour une expérience unique." },
            ].map((feature, i) => (
              <div key={i} className="bg-background p-8 rounded-2xl shadow-lg text-center flex flex-col items-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-border">
                <div className="text-pizza-yellow mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-pizza-green mb-3">{feature.title}</h3>
                <p className="text-foreground/90">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-pizza-dark text-pizza-light py-12">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} PizzaAI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
