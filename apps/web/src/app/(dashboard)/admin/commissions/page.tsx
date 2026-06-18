'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  CommissionConfig,
  DEFAULT_COMMISSION,
  flatTierTotal,
  validateCommissionConfig,
  collegeRowToConfig,
  withDerivedCompany,
} from '@/lib/commission-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Percent, Building2, Save, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const inputClass = 'w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm';
const readOnlyClass = 'w-full bg-secondary/30 rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed';

function CommissionEditor({
  title,
  subtitle,
  value,
  onChange,
  onSave,
  saving,
}: {
  title: string;
  subtitle?: string;
  value: CommissionConfig;
  onChange: (v: CommissionConfig) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const config = withDerivedCompany(value);
  const standardTotal = flatTierTotal(config, false);
  const premiumTotal = flatTierTotal(config, true);
  const validationError = validateCommissionConfig(config);
  const valid = !validationError;

  const update = (patch: Partial<CommissionConfig>) => onChange(withDerivedCompany({ ...value, ...patch }));

  const pctEditable = [
    { key: 'collegeCommissionPct' as const, label: 'College', hint: 'Partner college share' },
    { key: 'salesCommissionPct' as const, label: 'Sales', hint: 'Sales team share' },
    { key: 'mentorCommissionPct' as const, label: 'Mentor', hint: 'Mentor share' },
  ];

  const flatStandardEditable = [
    { key: 'collegeFlatInr' as const, label: 'College' },
    { key: 'salesFlatInr' as const, label: 'Sales' },
    { key: 'mentorFlatInr' as const, label: 'Mentor' },
  ];

  const flatPremiumEditable = [
    { key: 'collegeFlatPremiumInr' as const, label: 'College' },
    { key: 'salesFlatPremiumInr' as const, label: 'Sales' },
    { key: 'mentorFlatPremiumInr' as const, label: 'Mentor' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-500" /> {title}
        </CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update({ mode: 'PERCENTAGE' })}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              config.mode === 'PERCENTAGE' ? 'gradient-bg text-white' : 'bg-secondary/50 text-muted-foreground',
            )}
          >
            <Percent className="w-4 h-4" /> Percentage
          </button>
          <button
            type="button"
            onClick={() => update({ mode: 'FLAT_PER_STUDENT' })}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              config.mode === 'FLAT_PER_STUDENT' ? 'gradient-bg text-white' : 'bg-secondary/50 text-muted-foreground',
            )}
          >
            <IndianRupee className="w-4 h-4" /> Per Student (Flat)
          </button>
        </div>

        {config.mode === 'PERCENTAGE' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pctEditable.map(({ key, label, hint }) => (
              <div key={key}>
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <p className="text-[10px] text-muted-foreground mb-1">{hint}</p>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={config[key]}
                    onChange={(e) => update({ [key]: parseFloat(e.target.value) || 0 })}
                    className={inputClass}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Company Net</label>
              <p className="text-[10px] text-muted-foreground mb-1">Auto-calculated remainder</p>
              <div className="flex items-center gap-1">
                <input type="text" readOnly value={config.companyProfitPct.toFixed(1)} className={readOnlyClass} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Course fee threshold (INR)</label>
              <p className="text-[10px] text-muted-foreground mb-1">
                Courses at or below this fee use the standard tier; above uses premium tier
              </p>
              <input
                type="number"
                min={0}
                step={100}
                value={config.courseFeeThreshold}
                onChange={(e) => update({ courseFeeThreshold: parseInt(e.target.value, 10) || 0 })}
                className={`${inputClass} max-w-xs`}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">
                Standard tier (course fee ≤ ₹{config.courseFeeThreshold.toLocaleString('en-IN')})
              </p>
              <div className="mb-3 max-w-xs">
                <label className="text-xs text-muted-foreground">Total per student</label>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm text-muted-foreground">₹</span>
                  <input
                    type="number"
                    min={1}
                    value={config.standardFlatTotalInr}
                    onChange={(e) => update({ standardFlatTotalInr: parseInt(e.target.value, 10) || 0 })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {flatStandardEditable.map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm text-muted-foreground">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={config[key]}
                        onChange={(e) => update({ [key]: parseInt(e.target.value, 10) || 0 })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-xs text-muted-foreground">Company Net</label>
                  <p className="text-[10px] text-muted-foreground mb-1">Auto-calculated</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-sm text-muted-foreground">₹</span>
                    <input type="text" readOnly value={config.companyFlatInr} className={readOnlyClass} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Allocated: <strong>₹{standardTotal.toLocaleString('en-IN')}</strong> per enrollment
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">
                Premium tier (course fee &gt; ₹{config.courseFeeThreshold.toLocaleString('en-IN')})
              </p>
              <div className="mb-3 max-w-xs">
                <label className="text-xs text-muted-foreground">Total per student</label>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm text-muted-foreground">₹</span>
                  <input
                    type="number"
                    min={1}
                    value={config.premiumFlatTotalInr}
                    onChange={(e) => update({ premiumFlatTotalInr: parseInt(e.target.value, 10) || 0 })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {flatPremiumEditable.map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm text-muted-foreground">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={config[key]}
                        onChange={(e) => update({ [key]: parseInt(e.target.value, 10) || 0 })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-xs text-muted-foreground">Company Net</label>
                  <p className="text-[10px] text-muted-foreground mb-1">Auto-calculated</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-sm text-muted-foreground">₹</span>
                    <input type="text" readOnly value={config.companyFlatPremiumInr} className={readOnlyClass} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Allocated: <strong>₹{premiumTotal.toLocaleString('en-IN')}</strong> per enrollment
              </p>
            </div>
            <p className="text-xs text-purple-400/80">
              Company Net = Total per student − College − Sales − Mentor. Flat amounts are multiplied by active enrollments.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className={cn('text-sm', valid ? 'text-green-500' : 'text-red-400')}>
            {config.mode === 'PERCENTAGE'
              ? `Total: 100% (${config.companyProfitPct.toFixed(1)}% company net) ✓`
              : validationError ?? `Standard ₹${standardTotal} / Premium ₹${premiumTotal} per enrollment ✓`}
          </p>
          <Button size="sm" onClick={onSave} disabled={!valid || saving}>
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCommissionsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: () => api.getCommissions(),
  });

  const [defaults, setDefaults] = useState<CommissionConfig>(DEFAULT_COMMISSION);
  const [collegeEdits, setCollegeEdits] = useState<Record<string, CommissionConfig>>({});

  useEffect(() => {
    if (data?.defaults) setDefaults(withDerivedCompany({ ...DEFAULT_COMMISSION, ...data.defaults }));
    if (data?.colleges) {
      const map: Record<string, CommissionConfig> = {};
      for (const c of data.colleges) {
        map[c.id] = collegeRowToConfig(c);
      }
      setCollegeEdits(map);
    }
  }, [data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
    queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['admin-finance'] });
  };

  const saveDefaults = useMutation({
    mutationFn: () => api.updateDefaultCommission(withDerivedCompany(defaults)),
    onSuccess: () => { toast.success('Default commission saved'); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveCollege = useMutation({
    mutationFn: ({ id, config }: { id: string; config: CommissionConfig }) =>
      api.updateCollegeCommission(id, withDerivedCompany(config)),
    onSuccess: () => { toast.success('College commission updated'); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Percent className="w-8 h-8 text-purple-500" /> Revenue Commission
        </h1>
        <p className="text-muted-foreground mt-1">
          Use <strong>percentage</strong> of course fee or <strong>flat ₹ per student enrollment</strong> (standard vs premium tier by course fee)
        </p>
      </div>

      <CommissionEditor
        title="Default (Direct / Unassigned students)"
        subtitle="Fallback when a student has no college"
        value={defaults}
        onChange={setDefaults}
        onSave={() => saveDefaults.mutate()}
        saving={saveDefaults.isPending}
      />

      {isLoading ? (
        <p className="text-muted-foreground">Loading colleges...</p>
      ) : (
        data?.colleges.map((college) => {
          const config = collegeEdits[college.id];
          if (!config) return null;
          return (
            <CommissionEditor
              key={college.id}
              title={college.name}
              subtitle={`${college.code} · ${college._count.users} students · ${config.mode === 'FLAT_PER_STUDENT' ? 'Flat per enrollment' : 'Percentage'}`}
              value={config}
              onChange={(v) => setCollegeEdits({ ...collegeEdits, [college.id]: v })}
              onSave={() => saveCollege.mutate({ id: college.id, config })}
              saving={saveCollege.isPending}
            />
          );
        })
      )}
    </div>
  );
}
