'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, SVGProps } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
    </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    // The middleware will handle redirection upon successful login
    router.refresh();
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#fcf8f8] group/design-root overflow-x-hidden" style={{fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f3e7e8] px-10 py-3">
          <Link href="/" className="flex items-center gap-4 text-[#1b0e0e]">
            <div className="size-4 text-[#ea2832]">
              <LogoIcon />
            </div>
            <h2 className="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em]">PizzaAI</h2>
          </Link>
          <div className="flex flex-1 justify-end gap-8">
            <nav className="hidden md:flex items-center gap-9">
              <Link className="text-[#1b0e0e] text-sm font-medium leading-normal" href="/">Accueil</Link>
              <a className="text-[#1b0e0e] text-sm font-medium leading-normal" href="#">Produits</a>
              <a className="text-[#1b0e0e] text-sm font-medium leading-normal" href="#">Tarifs</a>
              <a className="text-[#1b0e0e] text-sm font-medium leading-normal" href="#">Ressources</a>
            </nav>
            <div className="flex gap-2">
                <Link href="/auth/login">
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ea2832] text-[#fcf8f8] text-sm font-bold leading-normal tracking-[0.015em]">
                        <span className="truncate">Connexion</span>
                    </button>
                </Link>
                <Link href="/contact">
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f3e7e8] text-[#1b0e0e] text-sm font-bold leading-normal tracking-[0.015em]">
                        <span className="truncate">Contact</span>
                    </button>
                </Link>
            </div>
          </div>
        </header>
        <main className="px-40 flex flex-1 justify-center py-5">
          <form onSubmit={handleLogin} className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h2 className="text-[#1b0e0e] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Connectez-vous à votre compte</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative max-w-[480px] mx-auto w-full" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">Email</p>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adresse@email.com"
                  required
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1b0e0e] focus:outline-0 focus:ring-0 border border-[#e7d0d1] bg-[#fcf8f8] focus:border-[#e7d0d1] h-14 placeholder:text-[#994d51] p-[15px] text-base font-normal leading-normal"
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">Mot de passe</p>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  required
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1b0e0e] focus:outline-0 focus:ring-0 border border-[#e7d0d1] bg-[#fcf8f8] focus:border-[#e7d0d1] h-14 placeholder:text-[#994d51] p-[15px] text-base font-normal leading-normal"
                />
              </label>
            </div>
            <p className="text-[#994d51] text-sm font-normal leading-normal pb-3 pt-1 px-4 underline">
                <a href="#">Mot de passe oublié ?</a>
            </p>
            <div className="flex px-4 py-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-[#ea2832] text-[#fcf8f8] text-base font-bold leading-normal tracking-[0.015em] disabled:bg-opacity-70"
              >
                <span className="truncate">{isLoading ? 'Connexion en cours...' : 'Connexion'}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}