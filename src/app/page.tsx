import { ArrowRight, Bot, Pizza, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-muted bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot size={28} className="text-primary" />
            <span className="font-bold text-xl">PizzaAI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Tarifs
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
          <button className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm">
            Demander une démo <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="container mx-auto px-6 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            L&apos;IA qui prend vos commandes de pizza.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Concentrez-vous sur la préparation de pizzas exceptionnelles. Notre assistant IA gère les appels, prend les commandes avec précision et améliore l&apos;expérience client.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-md hover:bg-primary/90 transition-colors">
              Commencer
            </button>
            <button className="bg-muted text-muted-foreground font-semibold py-3 px-8 rounded-md hover:bg-muted/90 transition-colors">
              Voir les tarifs
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted/50 py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Une solution complète pour votre pizzeria</h2>
              <p className="text-md text-muted-foreground mt-3 max-w-xl mx-auto">
                De la prise de commande à la gestion des menus, tout est automatisé pour vous faire gagner du temps.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Bot size={24} />, title: "Prise de commande 24/7", description: "Ne manquez plus jamais une commande, même en dehors des heures d'ouverture." },
                { icon: <Zap size={24} />, title: "Zéro erreur", description: "Notre IA confirme chaque détail de la commande pour une précision absolue." },
                { icon: <Pizza size={24} />, title: "Menu intelligent", description: "Gérez facilement vos pizzas, suppléments et offres spéciales." },
              ].map((feature, i) => (
                <div key={i} className="bg-background p-6 rounded-lg border">
                  <div className="flex items-center justify-center h-12 w-12 bg-primary text-primary-foreground rounded-md mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="border-t">
        <div className="container mx-auto px-6 py-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} PizzaAI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
