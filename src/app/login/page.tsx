import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inloggen</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Voer het wachtwoord in om Rental Planner te openen.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-zinc-500">Laden…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
