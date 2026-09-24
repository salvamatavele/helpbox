'use client';

import React from 'react';
import { ShieldCheck, Heart, Lock, PhoneCall } from 'lucide-react';

export function Footer() {

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/70 backdrop-blur-xs py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-600 text-xs sm:text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>Helpbox</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Plataforma ética de acolhimento social, ouvidoria e canal de denúncias desenhada para proteger quem precisa de apoio ou tem a coragem de relatar injustiças.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Compromisso de Sigilo</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Todas as mensagens e registos são estritamente confidenciais. Não gravamos endereços IP nem instalamos rastreadores de publicidade. O seu direito à discrição é absoluto.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <PhoneCall className="w-4 h-4 text-teal-600" />
            <span>Situações de Emergência Imediata</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Se estiver em risco iminente de vida ou violência física grave, procure também as autoridades locais ou linhas de emergência disponíveis na sua província/região.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <p>© {new Date().getFullYear()} Helpbox. Desenvolvido com foco no Serviço Social e Segurança de Dados.</p>
        <p className="flex items-center gap-1">
          Feito com empatia <Heart className="w-3 h-3 text-red-500 fill-red-500" /> para a comunidade.
        </p>
      </div>
    </footer>
  );
}
