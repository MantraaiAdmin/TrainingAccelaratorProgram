'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function CertificatesPage() {
  const { data: certificates, isLoading, refetch } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => api.getCertificates() as Promise<Array<{
      id: string;
      certificateId: string;
      studentName: string;
      trackName: string;
      issuedAt: string;
      qrCodeData?: string;
    }>>,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Certificates</h1>
        <p className="text-muted-foreground mt-1">Your earned certificates from completed tracks</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-secondary rounded-xl" />)}
        </div>
      ) : certificates?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <div className="h-2 gradient-bg" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-purple-500" />
                  <div>
                    <CardTitle>{cert.trackName}</CardTitle>
                    <p className="text-sm text-muted-foreground">ID: {cert.certificateId}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-1">
                  <p><strong>Student:</strong> {cert.studentName}</p>
                  <p><strong>Program:</strong> Constel AI NextGen</p>
                  <p><strong>Issued:</strong> {new Date(cert.issuedAt).toLocaleDateString()}</p>
                </div>
                {cert.qrCodeData && (
                  <img src={cert.qrCodeData} alt="QR Code" className="w-24 h-24 mx-auto" />
                )}
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" /> Download Certificate
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No certificates yet</h3>
            <p className="text-muted-foreground mt-1">
              Complete all track requirements to earn your certificate
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
