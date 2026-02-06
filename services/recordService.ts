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

const mapRecordFromDB = (data: any, visits: any[], images?: any[]): HarvestRecord => ({
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
  images: images?.map(img => ({
    id: img.id,
    storage_path: img.storage_path,
    file_name: img.file_name,
    file_size: img.file_size,
    url: supabase.storage.from('harvest-images').getPublicUrl(img.storage_path).data.publicUrl
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

    const recordNumbers = recordsData.map(r => r.record_number);

    const { data: visitsData, error: visitsError } = await supabase
      .from('technical_visits')
      .select('*')
      .in('record_number', recordNumbers);

    if (visitsError) throw visitsError;

    const recordIds = recordsData.map(r => r.id);
    const { data: imagesData, error: imagesError } = await supabase
      .from('harvest_images')
      .select('*')
      .in('harvest_record_id', recordIds);

    if (imagesError) console.error('Error loading images:', imagesError);

    return recordsData.map(record => {
      const recordVisits = visitsData?.filter(v => v.record_number === record.record_number) || [];
      const recordImages = imagesData?.filter(img => img.harvest_record_id === record.id) || [];
      return mapRecordFromDB(record, recordVisits, recordImages);
    });
  },

  async createRecord(record: HarvestRecord, imageFiles?: File[]): Promise<string> {
    const dbRecord = mapRecordToDB(record);
    const { data: insertedRecord, error: recordError } = await supabase
      .from('harvest_records')
      .insert(dbRecord)
      .select()
      .single();

    if (recordError) throw recordError;
    if (!insertedRecord) throw new Error('Failed to create record');

    if (record.visits.length > 0) {
      const dbVisits = record.visits.map(v => mapVisitToDB(v, record.recordNumber));
      const { error: visitsError } = await supabase
        .from('technical_visits')
        .insert(dbVisits);

      if (visitsError) throw visitsError;
    }

    if (imageFiles && imageFiles.length > 0) {
      await this.uploadImages(insertedRecord.id, imageFiles);
    }

    return insertedRecord.id;
  },

  async uploadImages(recordId: string, files: File[]): Promise<void> {
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${recordId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('harvest-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { error: dbError } = await supabase
        .from('harvest_images')
        .insert({
          harvest_record_id: recordId,
          storage_path: fileName,
          file_name: file.name,
          file_size: file.size
        });

      if (dbError) {
        console.error('Error saving image metadata:', dbError);
      }
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