'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Plus, Trash2, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

interface AdminTrack {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  priceInr: number;
  isPublished: boolean;
  isPlaceholder: boolean;
  difficulty: string;
  category: string;
  estimatedWeeks: number;
  _count: { trackAssignments: number; modules: number };
}

export default function AdminTracksPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', tagline: '', priceInr: 4999 });
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({});

  const { data: tracks, isLoading, error } = useQuery({
    queryKey: ['admin-tracks'],
    queryFn: () => api.getAdminTracks() as Promise<AdminTrack[]>,
  });

  const createMutation = useMutation({
    mutationFn: () => api.createAdminTrack(form),
    onSuccess: () => {
      toast.success('Track created');
      queryClient.invalidateQueries({ queryKey: ['admin-tracks'] });
      setShowForm(false);
      setForm({ name: '', slug: '', tagline: '', priceInr: 4999 });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.updateAdminTrack(id, data),
    onSuccess: () => {
      toast.success('Track updated');
      queryClient.invalidateQueries({ queryKey: ['admin-tracks'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAdminTrack(id),
    onSuccess: () => {
      toast.success('Track removed');
      queryClient.invalidateQueries({ queryKey: ['admin-tracks'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layers className="w-8 h-8 text-purple-500" /> Course Tracks
          </h1>
          <p className="text-muted-foreground mt-1">Add, remove, publish tracks and set pricing</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />Add Track
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Course Track</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <input
              placeholder="Track Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
              className="bg-secondary/50 rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="bg-secondary/50 rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Tagline"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="bg-secondary/50 rounded-lg px-3 py-2 text-sm col-span-2"
            />
            <input
              type="number"
              placeholder="Price (INR)"
              value={form.priceInr}
              onChange={(e) => setForm({ ...form, priceInr: parseInt(e.target.value) || 0 })}
              className="bg-secondary/50 rounded-lg px-3 py-2 text-sm"
            />
            <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.slug || createMutation.isPending}>
              Create Track
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {error && <p className="p-4 text-red-400">{(error as Error).message}</p>}
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Loading tracks...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left p-4">Track</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Modules</th>
                    <th className="text-left p-4">Assigned</th>
                    <th className="text-left p-4">Price (INR)</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks?.map((track) => (
                    <tr key={track.id} className="border-b border-border/50">
                      <td className="p-4">
                        <p className="font-medium">{track.name}</p>
                        <p className="text-xs text-muted-foreground">{track.slug}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${track.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {track.isPublished ? 'Published' : 'Draft'}
                        </span>
                        {track.isPlaceholder && (
                          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">Placeholder</span>
                        )}
                      </td>
                      <td className="p-4">{track._count.modules}</td>
                      <td className="p-4">{track._count.trackAssignments}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3 text-muted-foreground" />
                          <input
                            type="number"
                            value={editingPrice[track.id] ?? track.priceInr}
                            onChange={(e) => setEditingPrice({ ...editingPrice, [track.id]: e.target.value })}
                            className="w-24 bg-secondary/50 rounded px-2 py-1 text-xs"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateMutation.mutate({
                              id: track.id,
                              data: { priceInr: parseInt(editingPrice[track.id] ?? String(track.priceInr)) },
                            })}
                          >
                            Save
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateMutation.mutate({
                              id: track.id,
                              data: { isPublished: !track.isPublished, isPlaceholder: track.isPublished },
                            })}
                          >
                            {track.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400"
                            onClick={() => {
                              if (confirm(`Remove "${track.name}"? Active assignments will unpublish instead of delete.`)) {
                                deleteMutation.mutate(track.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
