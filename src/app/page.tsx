import { redirect } from 'next/navigation';

// La app abre directamente en el Xperimental Hub.
// El login de actores se movió a /login (sigue accesible desde el Hub).
export default function Home() {
    redirect('/hub');
}
