'use client';

import { useState } from 'react';
import { Award, FileText, Trophy, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InternshipCompletionSample } from '@/components/admin/sample-credentials/internship-completion';
import { LetterOfRecommendationSample } from '@/components/admin/sample-credentials/lor-document';
import { HackathonCompletionSample } from '@/components/admin/sample-credentials/hackathon-completion';
import { PaidInternshipCompletionSample } from '@/components/admin/sample-credentials/paid-internship-completion';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/branding';

const TABS = [
  {
    id: 'internship',
    label: 'Internship Completion',
    icon: Award,
    description: 'QR-verified certificate after 8-week track completion',
  },
  {
    id: 'lor',
    label: 'Letter of Recommendation',
    icon: FileText,
    description: 'Merit-based LoR for top-performing students',
  },
  {
    id: 'hackathon',
    label: 'Hackathon Completion',
    icon: Trophy,
    description: 'End-of-program hackathon participation & placement',
  },
  {
    id: 'paid-internship',
    label: 'Company Internship',
    icon: Briefcase,
    description: 'Mantra.ai certificate for top-performer internship completion',
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminSampleCredentialsPage() {
  const [active, setActive] = useState<TabId>('internship');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sample Credentials</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Preview and print sample certificates for college pitching. Uses demo student data —
          replace with live credentials when students complete the program.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                'text-left p-4 rounded-xl border transition-all',
                selected
                  ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'border-border hover:border-cyan-500/40 hover:bg-secondary/50',
              )}
            >
              <Icon className={cn('w-5 h-5 mb-2', selected ? 'text-cyan-600' : 'text-muted-foreground')} />
              <p className="font-semibold text-sm">{tab.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{tab.description}</p>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {TABS.find((t) => t.id === active)?.label} — Sample Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center bg-slate-100/80 dark:bg-slate-900/40 py-8 rounded-b-xl">
          {active === 'internship' && <InternshipCompletionSample />}
          {active === 'lor' && <LetterOfRecommendationSample />}
          {active === 'hackathon' && <HackathonCompletionSample />}
          {active === 'paid-internship' && <PaidInternshipCompletionSample />}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Sample data: Priya Sharma · SRM Institute · {BRAND.programName}
      </p>
    </div>
  );
}
