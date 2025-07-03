import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="bg-light-white text-custom-grey">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-light-white/80 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-lilita text-3xl bg-accent-yellow text-light-white px-3 py-1 rounded-md shadow-sm -rotate-2">
            <span className="text-white" style={{textShadow: '2px 2px #231F20'}}>PizzaCall</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="group text-custom-grey hover:text-accent-red transition-colors duration-300">
              Fonctionnalités
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-accent-red"></span>
            </a>
            <a href="#pricing" className="group text-custom-grey hover:text-accent-red transition-colors duration-300">
              Tarifs
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-accent-red"></span>
            </a>
          </nav>
          <button className="bg-accent-red text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 hover:scale-105 transform transition-all duration-300 ease-in-out shadow-lg">
            Demander une démo
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-green/80 via-custom-grey/90 to-accent-red/80"></div>
         <Image
            src="https://img.freepik.com/free-photo/fresh-pizza-with-salami-vegetables-dark-background_140725-6320.jpg"
            alt="Pizzeria background"
            layout="fill"
            objectFit="cover"
            className="opacity-30"
          />
        <div className="relative z-10 container mx-auto px-6 py-20">
          <h2 className="text-5xl md:text-7xl font-lilita text-light-white mb-4" style={{textShadow: '3px 3px #CD291E'}}>
            Libérez-vous du téléphone,
            <br/>
            <span className="text-accent-yellow">Concentrez-vous sur vos pizzas !</span>
          </h2>
          <p className="text-xl text-light-white/90 mb-8 max-w-2xl mx-auto">
            Notre IA prend les commandes pour vous, 24/7, sans erreur et avec une touche personnelle.
          </p>
          <button className="bg-accent-yellow text-custom-grey font-bold py-4 px-10 rounded-full text-lg hover:bg-yellow-500 transform hover:scale-110 transition-all duration-300 ease-in-out shadow-xl">
            Commencer l&apos;automatisation
          </button>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-light-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-lilita text-accent-red">Une solution pensée pour les pizzerias</h3>
            <p className="text-lg text-custom-grey/80 mt-2">Tout ce dont vous avez besoin pour optimiser votre temps.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Gain de temps massif", description: "Notre IA gère 100% des appels de commande, vous laissant libre de préparer vos délicieuses pizzas." },
              { title: "Zéro erreur de commande", description: "Fini les erreurs de saisie. Chaque commande est prise avec précision et confirmée au client." },
              { title: "Personnalisation avancée", description: "Configurez menus, offres, zones de livraison et plus pour une expérience unique." },
              { title: "Intégration simple", description: "Aucun matériel requis. Notre service s'intègre à votre ligne téléphonique existante." }
            ].map((feature, i) => (
              <div key={i} className="feature-card bg-white p-8 rounded-xl shadow-lg text-center border-t-4 border-accent-yellow hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <h4 className="text-2xl font-lilita text-dark-green mb-3">{feature.title}</h4>
                <p className="text-custom-grey/90">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-custom-grey text-light-white py-12">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} PizzaCall Automation. Tous droits réservés.</p>
          <div className="flex justify-center space-x-6 mt-4">
             {/* Add Lucide Icons here later if needed */}
          </div>
        </div>
      </footer>
    </div>
  );
}