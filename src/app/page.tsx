import Link from 'next/link';
import { SVGProps } from 'react';

// --- SVG Icon Components ---
// I am keeping these as separate components as it's a good practice.
const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
      fill="currentColor"
    />
  </svg>
);
const ClockIcon = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path></svg>;
const UsersIcon = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path></svg>;
const MoneyIcon = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152ZM240,56H16a8,8,0,0,0-8,8V192a8,8,0,0,0,8,8H240a8,8,0,0,0,8-8V64A8,8,0,0,0,240,56ZM193.65,184H62.35A56.78,56.78,0,0,0,24,145.65v-35.3A56.78,56.78,0,0,0,62.35,72h131.3A56.78,56.78,0,0,0,232,110.35v35.3A56.78,56.78,0,0,0,193.65,184ZM232,93.37A40.81,40.81,0,0,1,210.63,72H232ZM45.37,72A40.81,40.81,0,0,1,24,93.37V72ZM24,162.63A40.81,40.81,0,0,1,45.37,184H24ZM210.63,184A40.81,40.81,0,0,1,232,162.63V184Z"></path></svg>;
const TwitterIcon = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"></path></svg>;
const FacebookIcon = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"></path></svg>;
const InstagramIcon = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" {...props}><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path></svg>;


export default function HomePage() {
  return (
    <>
      {/* The head section is managed by Next.js in layout.tsx or via the Head component. 
          I will add the font links to the layout file. 
          The Tailwind script is not needed in Next.js as it's part of the build process. */}
      <div 
        className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" 
        style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f4f0f0] px-10 py-3">
            <Link href="/" className="flex items-center gap-4 text-[#181111]">
              <div className="size-4 text-[#e92932]">
                <LogoIcon />
              </div>
              <h2 className="text-[#181111] text-lg font-bold leading-tight tracking-[-0.015em]">Pizza AI</h2>
            </Link>
            <div className="flex flex-1 justify-end gap-8">
              <nav className="hidden items-center gap-9 md:flex">
                <a className="text-[#181111] text-sm font-medium leading-normal" href="#features">Fonctionnalités</a>
                <a className="text-[#181111] text-sm font-medium leading-normal" href="#pricing">Tarifs</a>
                <a className="text-[#181111] text-sm font-medium leading-normal" href="#testimonials">Témoignages</a>
                <a className="text-[#181111] text-sm font-medium leading-normal" href="#resources">Ressources</a>
              </nav>
              <div className="flex gap-2">
                <Link href="/auth/signup">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e92932] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Essai gratuit</span>
                  </button>
                </Link>
                <Link href="/auth/login">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f4f0f0] text-[#181111] text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Connexion</span>
                  </button>
                </Link>
              </div>
            </div>
          </header>
          <main className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <section className=" @container">
                <div className=" @[480px]:p-4">
                  <div
                    className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4"
                    style={{backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAQdrP_vTVEMVdxRSMOJsU6R_nhVO4wBTLAoTEHlWSZ2hBtBUtph4R03IZ8MDvQ1BiosC20IawlOfFL58hLjJwO5rPvmAiIpRIW-VemwHTKLmCc91zJ5h9DXkXrpA1OMTuDooxyQQRBySh8ajc_EC-7-Z-jvcSjuYD1l4QXzWVAhIdV6YVOu6q3ozuc1I4mxrpQJTAMlcQbJs2ARUJVRartX0rWra_1KRj9smB5-gQQjKjpY7HWWRDO20rFmCZ9Ki2KtNl8VHl8-A")'}}
                  >
                    <div className="flex flex-col gap-2 text-center">
                      <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                        Libérez votre temps, laissez l'IA prendre les commandes
                      </h1>
                      <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                        Nos agents IA répondent au téléphone et prennent les commandes pour vous, libérant ainsi votre temps pour vous concentrer sur la préparation de délicieuses pizzas.
                      </h2>
                    </div>
                    <Link href="/auth/signup">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#e92932] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]">
                        <span className="truncate">Découvrir nos agents IA</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </section>
              <section id="features" className="flex flex-col gap-10 px-4 py-10 @container">
                <div className="flex flex-col gap-4">
                  <h2 className="text-[#181111] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                    Pourquoi choisir Pizza AI ?
                  </h2>
                  <p className="text-[#181111] text-base font-normal leading-normal max-w-[720px]">
                    Nos agents IA sont conçus pour améliorer l'efficacité de votre pizzeria et la satisfaction de vos clients.
                  </p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-0">
                  <div className="flex flex-1 flex-col gap-3 rounded-lg border border-[#e5dcdc] bg-white p-4">
                    <div className="text-[#181111]"><ClockIcon /></div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[#181111] text-base font-bold leading-tight">Gain de temps</h3>
                      <p className="text-[#886364] text-sm font-normal leading-normal">
                        Nos agents IA prennent les commandes 24h/24 et 7j/7, vous permettant de vous concentrer sur la préparation des pizzas.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 rounded-lg border border-[#e5dcdc] bg-white p-4">
                    <div className="text-[#181111]"><UsersIcon /></div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[#181111] text-base font-bold leading-tight">Amélioration de l'expérience client</h3>
                      <p className="text-[#886364] text-sm font-normal leading-normal">
                        Les clients peuvent commander à tout moment, sans attendre, et bénéficier d'un service rapide et efficace.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 rounded-lg border border-[#e5dcdc] bg-white p-4">
                    <div className="text-[#181111]"><MoneyIcon /></div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[#181111] text-base font-bold leading-tight">Réduction des coûts</h3>
                      <p className="text-[#886364] text-sm font-normal leading-normal">
                        En automatisant la prise de commandes, vous réduisez les coûts liés au personnel et améliorez votre rentabilité.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              <section className=" @container">
                <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
                  <div className="flex flex-col gap-2 text-center">
                    <h2 className="text-[#181111] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px] mx-auto">
                      Prêt à transformer votre pizzeria ?
                    </h2>
                  </div>
                  <div className="flex flex-1 justify-center">
                    <div className="flex justify-center">
                      <Link href="/auth/signup">
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#e92932] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow">
                          <span className="truncate">Essai gratuit</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
              <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
                <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                  <a className="text-[#886364] text-base font-normal leading-normal min-w-40" href="#">Politique de confidentialité</a>
                  <a className="text-[#886364] text-base font-normal leading-normal min-w-40" href="#">Conditions d'utilisation</a>
                  <a className="text-[#886364] text-base font-normal leading-normal min-w-40" href="#">Contact</a>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="#"><div className="text-[#886364]"><TwitterIcon /></div></a>
                  <a href="#"><div className="text-[#886364]"><FacebookIcon /></div></a>
                  <a href="#"><div className="text-[#886364]"><InstagramIcon /></div></a>
                </div>
                <p className="text-[#886364] text-base font-normal leading-normal">© {new Date().getFullYear()} Pizza AI. Tous droits réservés.</p>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}