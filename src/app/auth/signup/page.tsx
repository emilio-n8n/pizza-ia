'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, SVGProps } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor"></path>
        <path fillRule="evenodd" clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor"></path>
    </svg>
);

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        // This will send a confirmation email to the user
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    // On success, Supabase sends a confirmation email. 
    // You should show a message to the user to check their email.
    // For this example, we'll just refresh to let the middleware handle it.
    // A better UX would be to show a "Check your email" message.
    router.push('/onboarding/choose-plan');
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#fcf8f8] group/design-root overflow-x-hidden" style={{fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f3e7e8] px-10 py-3">
          <Link href="/" className="flex items-center gap-4 text-[#1b0e0e]">
            <div className="size-4 text-[#ea2832]">
              <LogoIcon />
            </div>
            <h2 className="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em]">PizzAI</h2>
          </Link>
          <div className="flex flex-1 justify-end gap-8">
            <nav className="hidden md:flex items-center gap-9">
              <Link className="text-[#1b0e0e] text-sm font-medium leading-normal" href="/">Accueil</Link>
              <a className="text-[#1b0e0e] text-sm font-medium leading-normal" href="#">Produits</a>
              <a className="text-[#1b0e0e] text-sm font-medium leading-normal" href="#">Tarifs</a>
              <a className="text-[#1b0e0e] text-sm font-medium leading-normal" href="#">Ressources</a>
            </nav>
            <Link href="/auth/login">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#f3e7e8] text-[#1b0e0e] text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Connexion</span>
                </button>
            </Link>
          </div>
        </header>
        <main className="px-40 flex flex-1 justify-center py-5">
          <form onSubmit={handleSignup} className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h2 className="text-[#1b0e0e] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Créez votre compte</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative max-w-[480px] mx-auto w-full" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">Nom</p>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  required
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1b0e0e] focus:outline-0 focus:ring-0 border border-[#e7d0d1] bg-[#fcf8f8] focus:border-[#e7d0d1] h-14 placeholder:text-[#994d51] p-[15px] text-base font-normal leading-normal"
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">Adresse email</p>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
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
                  placeholder="Créez un mot de passe"
                  required
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1b0e0e] focus:outline-0 focus:ring-0 border border-[#e7d0d1] bg-[#fcf8f8] focus:border-[#e7d0d1] h-14 placeholder:text-[#994d51] p-[15px] text-base font-normal leading-normal"
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#1b0e0e] text-base font-medium leading-normal pb-2">Confirmer le mot de passe</p>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  required
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#1b0e0e] focus:outline-0 focus:ring-0 border border-[#e7d0d1] bg-[#fcf8f8] focus:border-[#e7d0d1] h-14 placeholder:text-[#994d51] p-[15px] text-base font-normal leading-normal"
                />
              </label>
            </div>
            <div className="flex px-4 py-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-[#ea2832] text-[#fcf8f8] text-base font-bold leading-normal tracking-[0.015em] disabled:bg-opacity-70"
              >
                <span className="truncate">{isLoading ? 'Inscription en cours...' : "S'inscrire"}</span>
              </button>
            </div>
            <p className="text-[#994d51] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Déjà un compte ? <Link href="/auth/login" className="underline">Connectez-vous</Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}