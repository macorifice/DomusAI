'use client';

import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import styles from '@/app/page.module.css';

type AuthPanelProps = {
  session: Session | null;
};

export function AuthPanel({ session }: AuthPanelProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');

  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return (
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Accesso</h2>
        </div>
        <p className={styles.warning}>
          Imposta nel frontend le variabili NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (vedi frontend/.env.example).
        </p>
      </section>
    );
  }

  if (session?.user) {
    return (
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Account</h2>
          <span className={`${styles.badge} ${styles.badgeAvailable}`}>Autenticato</span>
        </div>
        <div className={styles.authSignedRow}>
          <span className={styles.muted}>{session.user.email ?? session.user.id}</span>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setHint('');
              await supabase.auth.signOut();
              setBusy(false);
            }}
          >
            Esci
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Registrazione / Accesso</h2>
      </div>
      <p className={styles.cardSubtitle}>Supabase Auth: il workflow usa il tuo UUID (`sub`) come identificativo univoco.</p>
      <div className={styles.row}>
        <label className={styles.field}>
          Email
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className={styles.field}>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          disabled={busy || !email || !password}
          onClick={async () => {
            setBusy(true);
            setHint('');
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            setBusy(false);
            if (error) setHint(error.message);
          }}
        >
          {busy ? 'Accesso…' : 'Accedi'}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={busy || !email || !password}
          onClick={async () => {
            setBusy(true);
            setHint('');
            const { data, error } = await supabase.auth.signUp({ email, password });
            setBusy(false);
            if (error) {
              setHint(error.message);
              return;
            }
            if (data.user && !data.session) {
              setHint('Controlla la posta per confermare l’account, poi accedi.');
            }
          }}
        >
          Registrati
        </button>
      </div>
      {hint ? <p className={styles.muted}>{hint}</p> : null}
    </section>
  );
}
