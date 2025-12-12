import { connectToDatabase } from '@/lib/mongodb';

export interface CustomJewelleryRequest {
  _id?: string;
  fullName: string;
  phone: string;
  email: string;
  jewelleryType: string;
  metalType: string;
  budgetRange: string;
  description: string;
  images: string[];
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  internalNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function createCustomJewelleryRequest(data: Omit<CustomJewelleryRequest, '_id' | 'status' | 'createdAt' | 'updatedAt'>) {
  try {
    console.log('[v0] Creating custom jewellery request with data:', { ...data, images: data.images?.length || 0 });
    const { db } = await connectToDatabase();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const request = {
      ...data,
      images: data.images || [],
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('[v0] Inserting request into collection:', request);
    const result = await db.collection('custom_jewellery_requests').insertOne(request);
    console.log('[v0] Request inserted successfully with ID:', result.insertedId);
    
    return { _id: result.insertedId.toString(), ...request };
  } catch (error) {
    console.error('[v0] Error creating custom jewellery request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[v0] Error details:', errorMessage);
    throw new Error(`Failed to create custom jewellery request: ${errorMessage}`);
  }
}

export async function getCustomJewelleryRequests(filter?: { status?: string; search?: string }) {
  try {
    const { db } = await connectToDatabase();
    const query: any = {};
    
    if (filter?.status && filter.status !== 'all') {
      query.status = filter.status;
    }
    
    if (filter?.search) {
      query.$or = [
        { fullName: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
        { phone: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
      ];
    }
    
    const requests = await db
      .collection('custom_jewellery_requests')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    return requests.map(req => ({
      _id: req._id.toString(),
      ...req,
    }));
  } catch (error) {
    console.error('[v0] Error fetching custom jewellery requests:', error);
    throw error;
  }
}

export async function getCustomJewelleryRequestById(id: string) {
  try {
    const { db } = await connectToDatabase();
    const { ObjectId } = await import('mongodb');
    const request = await db.collection('custom_jewellery_requests').findOne({ _id: new ObjectId(id) });
    
    if (!request) return null;
    
    return {
      _id: request._id.toString(),
      ...request,
    };
  } catch (error) {
    console.error('[v0] Error fetching custom jewellery request:', error);
    throw error;
  }
}

export async function updateCustomJewelleryRequest(id: string, data: Partial<CustomJewelleryRequest>) {
  try {
    const { db } = await connectToDatabase();
    const { ObjectId } = await import('mongodb');
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    
    const result = await db
      .collection('custom_jewellery_requests')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
    
    if (!result) return null;
    
    return {
      _id: result._id.toString(),
      ...result,
    };
  } catch (error) {
    console.error('[v0] Error updating custom jewellery request:', error);
    throw error;
  }
}

export async function deleteCustomJewelleryRequest(id: string) {
  try {
    const { db } = await connectToDatabase();
    const { ObjectId } = await import('mongodb');
    const result = await db.collection('custom_jewellery_requests').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('[v0] Error deleting custom jewellery request:', error);
    throw error;
  }
}

