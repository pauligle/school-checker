declare module '@/components/ClientSchoolsMap' {
  interface ClientSchoolsMapProps {
    city?: string | null;
    center?: [number, number] | null;
    zoom?: number | null;
    selectedSchool?: string | null;
  }
  
  export default function ClientSchoolsMap(props: ClientSchoolsMapProps): JSX.Element;
}
