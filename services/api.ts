import { Customer, HarvestRecord, Crop } from '../types';
import { supabase } from '../lib/supabase';

export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }

    return data.map(customer => ({
      id: customer.id,
      name: customer.name,
      tradeName: customer.trade_name,
      regional: customer.regional as any,
      managerName: customer.manager_name,
      sellerName: customer.seller_name,
      city: customer.city,
      state: customer.state
    }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const fetchCrops = async (): Promise<Crop[]> => {
  try {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching crops:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching crops:', error);
    return [];
  }
};

export const fetchHarvestRecords = async (): Promise<HarvestRecord[]> => {
  try {
    const { data: records, error } = await supabase
      .from('harvest_records')
      .select(`
        *,
        visits:technical_visits(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching harvest records:', error);
      return [];
    }

    return records.map(record => ({
      recordNumber: record.record_number,
      submissionDate: record.submission_date,
      status: record.status as any,
      customerId: record.customer_id || 'MANUAL',
      customerName: record.customer_name,
      propertyName: record.property_name,
      locationUrl: record.location_url,
      cropId: record.crop_id,
      totalArea: parseFloat(record.total_area),
      plantedArea: parseFloat(record.planted_area),
      registrationNumber: record.registration_number,
      cprfCoordinates: record.cprf_coordinates,
      regional: record.regional,
      managerName: record.manager_name,
      sellerName: record.seller_name,
      city: record.city,
      state: record.state,
      visits: (record.visits || []).map((visit: any) => ({
        id: visit.id,
        date: visit.visit_date,
        stage: visit.stage,
        opinion: visit.opinion,
        author: visit.author
      }))
    }));
  } catch (error) {
    console.error('Error fetching harvest records:', error);
    return [];
  }
};

export const saveHarvestRecord = async (record: HarvestRecord): Promise<HarvestRecord | null> => {
  try {
    const { data: savedRecord, error: recordError } = await supabase
      .from('harvest_records')
      .insert({
        record_number: record.recordNumber,
        customer_id: null,
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
        state: record.state,
        status: 'PENDING',
        submission_date: new Date().toISOString()
      })
      .select()
      .single();

    if (recordError) {
      console.error('Error saving harvest record:', recordError);
      return null;
    }

    if (record.visits && record.visits.length > 0) {
      const visitsToInsert = record.visits.map(visit => ({
        harvest_record_id: savedRecord.id,
        visit_date: visit.date,
        stage: visit.stage,
        opinion: visit.opinion,
        author: visit.author
      }));

      const { error: visitsError } = await supabase
        .from('technical_visits')
        .insert(visitsToInsert);

      if (visitsError) {
        console.error('Error saving technical visits:', visitsError);
      }
    }

    return {
      ...record,
      submissionDate: savedRecord.submission_date,
      status: savedRecord.status as any
    };
  } catch (error) {
    console.error('Error saving harvest record:', error);
    return null;
  }
};