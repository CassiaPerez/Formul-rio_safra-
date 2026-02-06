import { supabase } from './supabase';
import { HarvestRecord, TechnicalVisit, RecordStatus } from '../types';

// Mappers to convert between CamelCase (App) and SnakeCase (DB)

const mapRecordToDB = (record: HarvestRecord) => ({
  record_number: record.recordNumber,
  submission_date: record.submissionDate || new Date().toISOString(),
  status: record.status || 'PENDING',
  customer_id: record.customerId,
  customer_name: record.customerName,
  property_name: record.propertyName,
  location_url: record.locationUrl,
  crop_id: record.cropId,
  total_area: record.totalArea,
  planted_area: record.plantedArea,
  registration_number: record.registrationNumber,
  cprf_coordinates: record.cprfCoordinates,
  regional: record.regional,
  manager_name: record.managerName,
  seller_name: record.sellerName,
  city: record.city,
  state: record.state
});

const mapVisitToDB = (visit: TechnicalVisit, recordNumber: string) => ({
  id: visit.id,
  record_number: recordNumber,
  date: visit.date,
  stage: visit.stage,
  opinion: visit.opinion,
  author: visit.author
});

const mapRecordFromDB = (data: any, visits: any[]): HarvestRecord => ({
  recordNumber: data.record_number,
  submissionDate: data.submission_date,
  status: data.status as RecordStatus,
  customerId: data.customer_id,
  customerName: data.customer_name,
  propertyName: data.property_name,
  locationUrl: data.location_url,
  cropId: data.crop_id,
  totalArea: Number(data.total_area),
  plantedArea: Number(data.planted_area),
  registrationNumber: data.registration_number,
  cprfCoordinates: data.cprf_coordinates,
  visits: visits.map(v => ({
    id: v.id,
    date: v.date,
    stage: v.stage,
    opinion: v.opinion,
    author: v.author
  })),
  regional: data.regional,
  managerName: data.manager_name,
  sellerName: data.seller_name,
  city: data.city,
  state: data.state
});

export const recordService = {
  
  async getAllRecords(): Promise<HarvestRecord[]> {
    const { data: recordsData, error: recordsError } = await supabase
      .from('harvest_records')
      .select('*')
      .order('submission_date', { ascending: false });

    if (recordsError) throw recordsError;
    if (!recordsData) return [];

    // Fetch visits for all these records
    // Ideally we would use a join, but for simplicity/flexibility with types:
    const recordNumbers = recordsData.map(r => r.record_number);
    const { data: visitsData, error: visitsError } = await supabase
      .from('technical_visits')
      .select('*')
      .in('record_number', recordNumbers);

    if (visitsError) throw visitsError;

    return recordsData.map(record => {
      const recordVisits = visitsData?.filter(v => v.record_number === record.record_number) || [];
      return mapRecordFromDB(record, recordVisits);
    });
  },

  async createRecord(record: HarvestRecord): Promise<void> {
    // 1. Insert Record
    const dbRecord = mapRecordToDB(record);
    const { error: recordError } = await supabase
      .from('harvest_records')
      .insert(dbRecord);

    if (recordError) throw recordError;

    // 2. Insert Visits
    if (record.visits.length > 0) {
      const dbVisits = record.visits.map(v => mapVisitToDB(v, record.recordNumber));
      const { error: visitsError } = await supabase
        .from('technical_visits')
        .insert(dbVisits);
      
      if (visitsError) throw visitsError;
    }
  },

  async updateStatus(recordNumber: string, status: RecordStatus): Promise<void> {
    const { error } = await supabase
      .from('harvest_records')
      .update({ status })
      .eq('record_number', recordNumber);

    if (error) throw error;
  }
};